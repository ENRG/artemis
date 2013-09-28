define(function(require){
  var utils       = require('utils');
  var Components  = require('components');
  var router      = require('./router');

  // Register Handlebars helpers
  require('./lib/hbt-helpers');

  var app = utils.extend({
    init: function(){
      // Initialize Main Application view
      app.view = new Components.App.Main();

      utils.domready(function(){
        app.view.render();
        app.view.$el.appendTo('body');

        // Give the router our global app variable
        router.init( app );
        app.router = router.router;

        app.trigger('app:ready');
      });
    }

  , changePage: function( page ){
      app.view.changePage.apply( app.view, arguments );
    }
  }, utils.clone( utils.Events ));

  return app;
});