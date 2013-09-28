define(function(require){
  var utils = require('utils');
  var Models = require('models');

  var Jobs = utils.Collection.extend({
    model: Models.Job
  });

  return Jobs;
});