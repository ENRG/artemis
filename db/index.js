var db = module.exports = {};

require('./mosql-helpers');

var copy    = require('pg-copy-streams');
var dirac   = require('dirac');
var config  = require('config');
var utils   = require('utils');
var filters = require('./dirac-filters');

for ( var key in dirac ) db[ key ] = dirac[ key ];

db.init = function( options ){
  options = options || {};

  dirac.destroy();

  dirac.use( dirac.tableRef() );
  dirac.use( filters.expandReferences );
  dirac.use( filters.upsert );
  dirac.use( dirac.dir( __dirname + '/dals' ) );

  dirac.init( utils.extend( {}, config.db, options ) );

  if ( !options.noSync ) dirac.sync( options.syncOptions );

  // Need to use this middleware while syncing so we
  // don't access dals before we've even got the table
  // started to be created
  dirac.use( filters.jobLeqs );

  for ( var key in dirac.dals ){
    db[ key ] = dirac.dals[ key ];
  }
};

db.jobLeqs = function( id ){
  return db[ [ 'jobs', id, 'leqs' ].join('_') ];
};

db.copy   = copy;
db.query  = dirac.query.bind( dirac );
db.raw    = dirac.raw.bind( dirac );