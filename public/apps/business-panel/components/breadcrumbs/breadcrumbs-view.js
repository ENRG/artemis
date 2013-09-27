/**
 * Component: BreadCrumbs
 * Provides the BreadCrumbs constructor
 */

define(function(require){
  var utils = require('utils');

  return utils.View.extend({
    template: require('hbs!./breadcrumbs-tmpl')

  , changePage: function( page ){
      this.$el.find('.page-name').text(
        this.options.sidebar.$el.find( '[data-page="' + page + ']' ).text()
      );
      return this;
    }
  });
});