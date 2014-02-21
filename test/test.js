var proc      = require('child_process');
var http      = require('http');
var utils     = require('utils');
var db        = require('db');
var config    = require('config');
var server    = require('../');
var fixtures  = require('./fixtures');
var nmts      = require('../lib/nmts');
var MockNmt   = require('p4441-stream').MockServer;

var fns = [];

config.changeEnvironment('test');

// Connect to the Database
db.init( utils.extend( { noSync: true }, config.db ) );

nmts.init();

// Drop all tables
fns.push(function(done){
  db.dropAllTables( function( error ){
    if ( error ) return done( error );
    setTimeout( done, 500 );
  });
});

// Sync all tables
fns.push(function(done){
  db.sync( function( error ){
    if ( error ) return done( error );
    setTimeout( done, 500 );
  });
});

// Insert data
for (var key in fixtures){
  (function(table, records){
    for (var i = 0; i < records.length; i++){
      (function(record){
        fns.push(function(done){
          db[table].insert(record, setImmediate( done ));
        });
      })(records[i]);
    }
  })(key, fixtures[key]);
}

// Start the MockNMTs
fns.push(function( done ){
  db.nmts.find({ is_active: true }, function( error, nmts ){
    if ( error ) return done( error );

    utils.async.series( nmts.map( function( nmt ){
      return function( done ){
        var server = new MockNmt( nmt ).listen( function(){
          console.log( 'MockNMT listening on port', server.options.port );
          done();
        });
      };
    }), done );
  });
});

// Ensure nmts module starts AFTER MockNMTs have started
fns.push(function( done ){
  nmts.start( done );
});

// Start Artemis in another process
fns.push(function(done){
  server.init();

  server.configure(function(){
    server.set('port', config.port);
  });

  http.createServer(server).listen(server.get('port'), function(){
    console.log("Artemis listening on port " + server.get('port'));
    done();
  });
});

before(function(done){
  this.timeout(12000);
  utils.async.series(fns, done);
});