/**
 * Component: AppSidebar
 * Provides the AppSidebar constructor
 */

define(function(require){
  var utils = require('utils');

  return utils.View.extend({
    template: require('hbs!./app-sidebar-tmpl')

  , changePage: function( page ){
      var $el = this.$el.find('[data-page="' + page + '"]');

      if ( $el.length ){
        this.$el.find('li.active').removeClass('active');
        $el.addClass('active');
      }

      return this;
    }
  });
});