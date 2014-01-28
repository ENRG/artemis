var EventEmitter  = require('events').EventEmitter;
var db            = require('db');
var utils         = require('utils');
var NmtStream     = require('./nmt-stream');

module.exports = Object.create( utils.extend( {},

EventEmitter.prototype, {

  streams:  {}

, isRunning: false

, init: function( options ){
    this.options = options ? utils.clone( options ) : {};

    utils.defaults( this.options, {
      loopInterval: 2000
    });

    return this;
  }

, start: function(){
    this.isRunning = true;
    this.loop();

    return this;
  }

, stop: function(){
    this.isRunning = false;
    return this;
  }

, loop: function(){
    if ( !this.isRunning ) return;

    var this_ = this;

    db.nmts.find( {}, function( error, results ){
      if ( error ) throw error;

      results.forEach( function( nmt ){
        if ( nmt.is_active ){
          if ( !(nmt.id in this_.streams) ) this_.register( nmt );
        } else {
          if ( nmt.id in this_.streams ) this_.unregister( nmt.id );
        }
      });
    });

    return setTimeout( this.loop.bind( this ), this.options.loopInterval );
  }

, register: function( nmt ){
    var stream = this.streams[ nmt.id ] = new NmtStream( nmt )

    stream.connect( function( error ){
      if ( error ) return;

      stream.enterRealTime();
    });

    return stream;
  }

, unregister: function( id ){
    if ( !this.streams[ id ] ) return this;

    this.streams[ id ].destroy();

    return this;
  }

, getStreamById: function( id ){
    return this.streams[ id ];
  }
}));
