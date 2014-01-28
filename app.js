var http    = require('http');
var db      = require('db');
var server  = require('./');
var config  = require('./config');
var nmts    = require('./lib/nmts');

db.init( config.db );
nmts.init().start();

server.init();

server.configure(function(){
  server.set('port', config.port);
});

http.createServer(server).listen(server.get('port'), function(){
  console.log("Artemis listening on port " + server.get('port'));
});