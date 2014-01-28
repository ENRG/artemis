var db      = require('db');
var config  = require('config');
var nmts    = require('./lib/nmts');

config.changeEnvironment('test');

db.init({ noSync: true });
nmts.init();
nmts.start();

nmts.getStreamById( 601 ).on( 'leq', function( leq ){
  console.log( leq );
});