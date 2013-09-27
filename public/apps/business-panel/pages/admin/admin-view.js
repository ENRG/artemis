/**
 * Page: Admin
 * Provides the Admin constructor
 */

define(function(require){
  var utils = require('utils');

  return utils.View.extend({
    className: 'page page-admin'
  , template: require('hbs!./admin-tmpl')
  });
});