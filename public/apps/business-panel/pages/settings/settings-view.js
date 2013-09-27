/**
 * Page: Reports
 * Provides the Reports constructor
 */

define(function(require){
  var utils = require('utils');

  return utils.View.extend({
    className: 'page page-settings'
  , template: require('hbs!./settings-tmpl')
  });
});