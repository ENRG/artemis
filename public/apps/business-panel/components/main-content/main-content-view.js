/**
 * Component: MainContent
 * Provides the MainContent constructor
 */

define(function(require){
  var utils = require('utils');
  var Pages = require('pages');

  return utils.View.extend({
    children: {
      'dashboard':    Pages.Dashboard.Main
    , 'reports':      Pages.Reports.Main
    , 'audio':        Pages.Audio.Main
    , 'settings':     Pages.Settings.Main
    }
  });
});