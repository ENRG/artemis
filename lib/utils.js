var
  util  = require('util')
, msql  = require('mongo-sql')
, utils = module.exports = {}
;

for (var key in util) utils[key] = util[key];
