var proc      = require('child_process');
var http      = require('http');
var utils     = require('../lib/utils');
var db        = require('leto');
var config    = require('../config');
var server    = require('../');
var fixtures  = require('./fixtures');

var fns = [];

config.changeEnvironment('test');


// Connect to the Database
fns.push(function(done){
  db.connect({ connStr: config.db.connStr }, done);
});

// Drop all tables
fns.push(function(done){
  db.dropAllTables(done);
});

// Sync all tables
fns.push(function(done){
  db.sync(done);
});

// Start Artemis in another process
fns.push(function(done){
  server.configure(function(){
    server.set('port', config.port);
  });

  http.createServer(server).listen(server.get('port'), done);
});

// Insert data
for (var key in fixtures){
  (function(table, records){
    for (var i = 0; i < records.length; i++){
      (function(record){
        fns.push(function(done){
          db[table].insert(record, done);
        });
      })(records[i]);
    }
  })(key, fixtures[key]);
}

before(function(done){
  utils.async.series(fns, done);
});