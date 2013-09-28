define(function(require){
  var Handlebars  = require('handlebars');
  var config      = require('config');
  var utils       = require('utils');
  var job         = require('job');

  Handlebars.registerHelper('location', function( key ){
    if ( !key ) return window.location;
    return window.location[ key ];
  });

  Handlebars.registerHelper('config', function( key ){
    if ( !key ) return config;
    return config[ key ];
  });

  Handlebars.registerHelper('job', function( key ){
    if ( !key ) return job.toJSON();
    return job.get( key );
  });
});