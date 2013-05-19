var
  pg = require('pg')
, db = module.exports = {}
;

db.connect = function(options, callback){
  return pg.connect(options);
};

require('./dals/users');