/**
 * Component: BreadCrumbs
 * Provides the BreadCrumbs constructor
 */

define(function(require){
  var utils = require('utils');

  return utils.View.extend({
    template: require('hbs!./breadcrumbs-tmpl')

  , initialize: function(){
      this.model = {};
      return this;
    }

  , setNavView: function( view ){
      this.navView = view;
      return this;
    }

  , changePage: function( page ){
      if ( !this.navView ) throw new Error('BreadCrumbs.changePage - attempting to change page before nav view set');

      this.model.page = this.navView.$el.find( '[data-page="' + page + '"]' ).text();
      this.render();

      return this;
    }
  });
});