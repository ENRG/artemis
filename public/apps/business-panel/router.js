define(function(require){
  var utils = require('utils');

  var app; // Will fulfill

  var Router = utils.Router.extend({
    routes: {
      '':           'dashboard'
    , 'reports':    'reports'
    , 'audio':      'audio'
    , 'settings':   'settings'
    }

  , dashboard: function(){
      app.changePage('dashboard');
    }

  , reports: function(){
      app.changePage('reports');
    }

  , audio: function(){
      app.changePage('audio');
    }

  , settings: function(){
      app.changePage('settings');
    }
  });

  var exports = {
    init: function( _app ){
      exports.router = new Router();

      // Patch the app variable to avoid circular dependencies
      app = _app;

      utils.Backbone.history.start();
    }
  };

  return exports;
});