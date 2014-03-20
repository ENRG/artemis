/**
 * MoSQL Helpers
 */

var mosql = require('mongo-sql');

mosql.registerQueryType(
  'copy-from'
, 'copy {table} ( {columns} ) from {expression}'
);

var columnsHelper = mosql.queryHelpers.get('columns');
mosql.registerQueryHelper('columns', function( columns, values, query ){
  if ( query.type === 'copy-from' ){
    return columns.map( function( col ){
      return mosql.quoteColumn( col );
    }).join(', ');
  }

  return columnsHelper.fn( columns, values, query );
});