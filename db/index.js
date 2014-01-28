var db = module.exports = {};

require('./mosql-helpers');

var dirac   = require('dirac');
var config  = require('config');
var utils   = require('utils');
var filters = require('./dirac-filters');

var tables = [
  'users'
, 'leqs'
, 'jobs'
, 'nmts'
, 'reports'
];

for ( var key in dirac ) db[ key ] = dirac[ key ];

db.init = function( options ){
  options = options || {};

  dirac.destroy();

  dirac.use( filters.expandReferences );
  dirac.use( filters.upsert );

  tables.map( function( t ){
    return require( './dals/' + t );
  }).forEach( dirac.register );

  dirac.init( utils.extend( {}, config.db, options ) );

  if ( !options.noSync ) dirac.sync( options.syncOptions );

  for ( var key in dirac.dals ){
    db[ key ] = dirac.dals[ key ];
  }
};