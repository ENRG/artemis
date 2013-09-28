/**
 * Component: App
 * Provides the AppView constructor
 */

define(function(require){
  var utils = require('utils');

  // Cannot reference top-level components from a component
  var Components = {
    AppContent:   require('../main-content/index')
  , AppSidebar:   require('../app-sidebar/index')
  , BreadCrumbs:  require('../breadcrumbs/index')
  };

  return utils.View.extend({
    template: require('hbs!./app-tmpl')

  , children: {
      content:      new Components.AppContent.Main()
    , sidebar:      new Components.AppSidebar.Main()
    , breadcrumbs:  new Components.BreadCrumbs.Main()
    }

  , regions: {
      'content':      '.app-main-content'
    , 'sidebar':      '.app-side-nav'
    , 'breadcrumbs':  '.breadcrumb'
    }

  , initialize: function(){
      this.children.breadcrumbs.setNavView( this.children.sidebar );

      return this;
    }

  , render: function(){
      this.setElement( this.template() );

      this.applyRegions();
      this.renderRegions();

      return this;
    }

    /**
     * Changes the main application area page
     * @param  {String} page    The page to switch to
     * @param  {Object} options Options for page init/onShow and transition
     * @return {View}           The Backbone.View representing the page
     */
  , changePage: function( page, options ){
      this.children.sidebar.changePage( page );
      this.children.breadcrumbs.changePage( page );
      return this.children.content.changeView( page, options );
    }
  });
});