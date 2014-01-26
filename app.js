var http    = require('http');
var db      = require('leto');
var server  = require('./');
var config  = require('./config');

db.init( config.db );

server.init();

server.configure(function(){
  server.set('port', config.port);
});

http.createServer(server).listen(server.get('port'), function(){
  console.log("Artemis listening on port " + server.get('port'));
});
