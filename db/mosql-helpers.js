/**
 * MoSQL Helpers
 */

var mosql = require('mongo-sql');

mosql.registerQueryType(
  'copy'
, 'copy {table} from {expression}'
);