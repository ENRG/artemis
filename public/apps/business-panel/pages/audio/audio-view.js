/**
 * Page: Reports
 * Provides the Reports constructor
 */

define(function(require){
  var utils = require('utils');

  return utils.View.extend({
    className: 'page page-audio'
  , template: require('hbs!./audio-tmpl')
  });
});