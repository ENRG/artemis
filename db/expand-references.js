/**
 * Expand References
 */

var dirac = require('dirac');

var expandReferences = function( field ){
  return function( $query, schema, next ){
    if ( !schema[ field ].expandReferences ) return next();

    if ( !$query.joins ) $query.joins = [];

    var references;

    if ( schema[ field ].references ){
      references = schema[ field ].references;
    } else {
      references = schema[ field ].expandReferences;
    }

    var leftJoin = {
      type:   'left'
    , alias:  references.table
    , on:     {}
    , target: {
        type: 'select',
        table: references.table,
        columns: [
          references.column
        , {
            type: 'row_to_json'
          , alias: references.table
          , expression: references.table
          }
        ]
      }
    };

    leftJoin.on[ references.table + '.' + references.column ] = {
      $in: {
        type: 'select'
      , expression: {
          type: 'unnest'
        , expression: '"' + [
            Array.isArray( $query.table ) ? $query.table[0] : $query.table
          , field
          ].join('"."') + '"'
        }
      }
    };

    $query.joins.push( leftJoin );

    if ( !$query.columns ) $query.columns = ['*'];

    var type = schema[ field ].type;

    $query.columns.push({
      type: 'array_to_json'
    , alias: 'jobs'
    , expression: [
        'coalesce('
      , 'nullif( array_agg('
      , '"' + references.table + '"."' + references.table + '"'
      , ')::text[]'
      , ', array[null]::text[]'
      , '), array[]::text[]'
      , ')::json[]'
      ].join(' ')
    });

    if ( !$query.groupBy ) $query.groupBy = [];
    else if ( !Array.isArray( $query.groupBy ) ){
      $query.groupBy = [ $query.groupBy ];
    }

    var groupBy;

    if ( schema.id && schema.id.primaryKey ) groupBy = 'id'
    else {
      for ( var key in schema ){
        if ( schema[ key ].primaryKey ){
          groupBy = key;
          break;
        }
      }
    }

    $query.groupBy.push( groupBy );

    next();
  };
};

module.exports = function(){
  var dal, column, filter;

  for ( var k in dirac.dals ){
    dal = dirac.dals[ k ];

    for ( var name in dal.schema ){
      column = dal.schema[ name ];

      if ( !column.expandReferences ) continue;

      filter = expandReferences( name );

      dal.before( 'find',     filter );
      dal.before( 'findOne',  filter );
    }
  }
};