var proc      = require('child_process');
var http      = require('http');
var utils     = require('utils');
var db        = require('db');
var config    = require('config');
var server    = require('../');
var fixtures  = require('./fixtures');
var nmts      = require('../lib/nmts');

var fns = [];

config.changeEnvironment('test');

// Connect to the Database
db.init( utils.extend( { noSync: true }, config.db ) );

nmts.init().start();

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

// // Insert data
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

before(function(done){
  utils.async.series(fns, done);
});