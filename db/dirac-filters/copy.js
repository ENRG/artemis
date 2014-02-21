var copy  = require('pg-copy-stream');
var utils = require('utils');
var pg    = require('pg');

module.exports = function( dirac ){
  dirac.DAL = dirac.DAL.extend({
    copy: function( options, callback ){
      if ( typeof options === 'function' ){
        callback = options;
        options = {};
      }

      var query = utils.defaults( options, {
        type:       'copy'
      , table:      this.table
      , expression: 'stdin'
      });

      query = utils.sql( query );

      pg.connect( this.connString, function( error, client, done ){
        if ( error ) return callback( error );

        callback( null, client.query( query.toString(), query.values ) );
      });
    }
  });
};