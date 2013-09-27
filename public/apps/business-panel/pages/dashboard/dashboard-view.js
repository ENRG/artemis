/**
 * Page: Dashboard
 * Provides the Dashboard constructor
 */

define(function(require){
  var utils = require('utils');

  return utils.View.extend({
    className: 'page page-dashboard'
  , template: require('hbs!./dashboard-tmpl')
  });
});