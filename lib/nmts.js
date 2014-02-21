var EventEmitter  = require('events').EventEmitter;
var db            = require('db');
var utils         = require('utils');
var NmtStream     = require('p4441-stream').LeqStream;

module.exports = Object.create( utils.extend( {},

EventEmitter.prototype, {

  streams:  {}

, isRunning: false

, init: function( options ){
    this.options = options ? utils.clone( options ) : {};

    utils.defaults( this.options, {
      loopInterval: 1000
    });

    return this;
  }

, start: function( callback ){
    this.isRunning = true;
    this.loop( callback );

    return this;
  }

, stop: function(){
    this.isRunning = false;
    return this;
  }

, loop: function( callback ){
    if ( !this.isRunning ) return;

    var this_ = this;

    db.nmts.find( {}, function( error, results ){
      if ( callback && error ) return callback( error );
      if ( error ) throw error;

      results.forEach( function( nmt ){
        if ( nmt.is_active ){
          if ( !(nmt.id in this_.streams) ) this_.register( nmt );
          else {
            // Must have had a pending stream request
            this_.streams[ nmt.id ].setNmt( nmt );
          }
        } else {
          if ( nmt.id in this_.streams ) this_.unregister( nmt.id );
        }
      });
    });

    return setTimeout( function(){
      if ( callback ) callback();
      this_.loop();
    }, this.options.loopInterval );
  }

, register: function( nmt, callback ){
    callback = callback || utils.noop;

    var this_ = this;
    var stream = this.streams[ nmt.id ] = new NmtStream( nmt );

    stream.connect();

    stream.on( 'close', function(){
      delete this_.streams[ nmt.id ];
    });

    return stream;
  }

, unregister: function( id ){
    if ( !this.streams[ id ] ) return this;

    this.streams[ id ].destroy();

    return this;
  }

, getStreamById: function( id ){
    if ( !(id in this.streams) ){
      this.streams[ id ] = new NmtStream();
    }

    return this.streams[ id ];
  }
}));
