define(function(require){
  var utils = require('utils');

  return utils.Model.extend({
    urlRoot: '/api/jobs'
  });
});