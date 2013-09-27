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

    /**
     * Changes the main application area page
     * @param  {String} page    The page to switch to
     * @param  {Object} options Options for page init/onShow and transition
     * @return {View}           The Backbone.View representing the page
     */
  , changePage: function( page, options ){
      app.view.children.sidebar.changePage( page );
      return app.view.children.content.changeView( page, options );
    }
  }, utils.clone( utils.Events ));

  return app;
});