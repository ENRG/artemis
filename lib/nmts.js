var db = require('db');
var RealTimeStream = require('./nmt-stream');

module.exports.streams = {};

module.exports.init = function( callback ){
  if ( typeof callback !== 'function' ){
    throw new Error('Nmts.init must be passed a callback');
  }

  var $query = {
    online: true
  };

  db.nmts.find( $query, function( error, nmts ){
    if ( error ) return callback( error );

    nmts.forEach( module.exports.register );
  });
};

module.exports.register = function( nmt ){
  module.exports.streams[ nmt.id ] = new RealTimeStream( nmt );
};

module.exports.getStreamById = function( id ){
  return module.exports.streams[ id ];
};