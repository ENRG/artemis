/**
 * Dirac filters - Cast to JSON
 *
 * Registers before filters on inserts and updates
 * on all dals with column type: 'json'
 */

var dirac = require('dirac');

var hasJsonType = function( table ){
  if ( !(table in dirac.dals) ) return false;

  for ( var key in dirac.dals[ table ].schema){
    if ( dirac.dals[ table ].schema[ key ].type === 'json' ) return true;
  }

  return false;
};

var stringifyJSON = function( fields ){
  if ( !Array.isArray( fields ) ) fields = [ fields ];

  return function( $query, schema, next ){
    for ( var i = 0, l = fields.length; i < l; ++i ){
      if ( typeof ($query.updates || {})[ fields[i] ] == 'object' ){
        $query.updates[ fields[i] ] = JSON.stringify( $query.updates[ fields[i] ] );
      }

      if ( typeof ($query.values || {})[ fields[i] ] == 'object' ){
        $query.values[ fields[i] ] = JSON.stringify( $query.values[ fields[i] ] );
      }
    }

    next();
  };
};

module.exports = function(){  
  // Object.keys( dirac.dals ).filter(
  //   hasJsonType
  // ).forEach( function( table ){
  //   var schema = dirac.dals[ table ].schema;
  //   var jsonCols = Object.keys( schema ).filter( function( column ){
  //     return schema[ column ].type === 'json';
  //   });

  //   dirac.dals[ table ].before( 'insert', stringifyJSON( jsonCols ) );
  //   dirac.dals[ table ].before( 'update', stringifyJSON( jsonCols ) );
  // });
};