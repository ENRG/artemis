var assert  = require('assert');
var db      = require('db');
var utils   = require('utils');
var nmts    = require('../lib/nmts');

require('sugar');

describe('Real-Time', function(){
  it ('should be streaming', function( done ){
    var numToGet = 3, i = 0;
    this.timeout( 5000 );

    nmts.getStreamById(601).on( 'leq', function( leq ){
      if ( ++i === numToGet ) return done();

      assert.equal( typeof leq, 'number' );
      assert.equal( leq > 0, true );
    });
  });

  it ('should be streaming, but then stop', function( done ){
    this.timeout( 5000 );

    var stream = nmts.getStreamById(601);
    var numToGet = 2, i = 0;
    var numComplete = function(){
      stream.removeListener( 'leq', onLeq );

      db.nmts.update( 601, { is_active: false }, function( error ){
        assert.equal( !error, true );
      });

      stream.once( 'close', function(){
        console.log("did end");
        db.nmts.update( 601, { is_active: true }, function( error ){
          assert.equal( !error, true );
          done();
        });
      });
    };

    var onLeq = function( leq ){
      if ( ++i === numToGet ) return numComplete();

      assert.equal( typeof leq, 'number' );
      assert.equal( leq > 0, true );
    };

    stream.on( 'leq', onLeq );
  });
});