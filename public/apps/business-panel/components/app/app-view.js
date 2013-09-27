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
    , 'breadcrumbs':  '.app-side-nav'
    }

  , render: function(){
      this.setElement( this.template() );

      this.applyRegions();

      for ( var key in this.regions ){
        this.children[ key.replace('>', '') ].render();
      }
    }
  });
});