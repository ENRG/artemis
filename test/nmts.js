var assert  = require('assert');
var db      = require('db');
var utils   = require('utils');
var nmts    = require('../lib/nmts');
var MockNmt = require('../lib/mock-nmt');

before( function( done ){
  // Start the mock-NMTs
  db.nmts.find({ is_active: true }, function( error, nmts ){
    if ( error ) return done( error );

    utils.async.series( nmts.map( function( nmt ){
      return function( done ){ new MockNmt( nmt ).listen( done ) };
    }), done );
  });
});

describe('Real-Time', function(){
  it ('should be streaming', function( done ){
    var numToGet = 4, i = 0;
    this.timeout( 5000 );

    nmts.getStreamById(601).on( 'leq', function( leq ){
      if ( ++i === numToGet ) return done();

      assert.equal( typeof leq, 'number' );
      assert.equal( leq > 0, true );
    });
  });
});