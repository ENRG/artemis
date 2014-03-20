var fs      = require('fs');
var path    = require('path');
var assert  = require('assert');
var db      = require('db');
var utils   = require('utils');
var proc    = require('child_process');

require('sugar');

var options = {
  bin:    path.join( __dirname, '../bin/dat-to-db.js' )
, data:   path.join( __dirname, './test-data-results' )
};

var tests = {
  '506-20140201-0000-0010': ['-n', 506, '-f', 'data/506/minute/20140201.dat', '--stdout', '-b', "2014-02-01 00:00", '-e', "2014-02-01 00:01"]
, '506-20140201-0010-0020': ['-n', 506, '-f', 'data/506/minute/20140201.dat', '--stdout', '-b', "2014-02-01 00:01", '-e', "2014-02-01 00:02"]
, '506-20140204-0100-0110': ['-n', 506, '-f', 'data/506/minute/20140204.dat', '--stdout', '-b', "2014-02-04 01:00", '-e', "2014-02-04 01:01"]
};

describe('Data Restore', function(){
  var createTest = function( key ){
    it( 'should process ' + key, function( done ){
      var result = "";

      var bin = proc.spawn(
        'node', [ options.bin ].concat( tests[ key ] )
      );

      bin.stdout.on( 'data', function( data ){
        result += data.toString();
      });

      bin.on( 'close', function(){
        var f = path.join( options.data, key );
        assert.equal( result, fs.readFileSync( f ).toString() )
        done();
      });

      bin.stderr.on( 'data', function( error ){
        assert.equal( true, false );
      });
    });
  };

  for ( var key in tests ){
    createTest( key );
  }
});