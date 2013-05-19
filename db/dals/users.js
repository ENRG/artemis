var
  utils = require('../../lib/utils')
, db    = require('../db')
;

db.users = new utils.DataAccess.Collection.extend({
  table: 'users'
})();