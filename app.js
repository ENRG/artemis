var http    = require('http');
var db      = require('leto');
var server  = require('./');
var config  = require('./config');

server.configure(function(){
  server.set('port', config.port);
});

db.connect({ connStr: config.db.connStr }, function(error){
  if (error) throw error;

  db.sync();
});

http.createServer(server).listen(server.get('port'), function(){
  console.log("Artemis listening on port " + server.get('port'));
});
