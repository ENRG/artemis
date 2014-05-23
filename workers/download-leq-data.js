/**
 * Worker: Download Data Files
 */

var fs      = require('fs');
var path    = require('path');
var db      = require('db');
var utils   = require('utils');
var config  = require('config');

db.init({ noSync: true });

var onError = function( error ){
  throw error;
};

var onNmtLoaded = function( nmt, callback ){
  console.log( 'NMT', nmt.id );

  var ftp = new utils.FtpClient();

  var onFile = function( file, callback ){
    var $query = {
      nmt_id:  nmt.id
    , date:   +file.name.replace( '.dat', '' )
    , size:   +file.size
    };

    db.nmt_hourly_logs.findOne( $query, function( error, log ){
      if ( error ) return callback( error );

      // Log was found to be the same size
      if ( log ) return callback();
      
      var p = path.join( config.nmt.remoteLeqPath, file.name );

      console.log('  => downloading:', file.name );

      ftp.get( p, function( error, fstream ){
        if ( error ) return callback( error );

        var loc = config.nmt.localLeqPath.replace( ':nmtId', nmt.id );

        fstream.pipe(
          fs.createWriteStream( path.join( loc, file.name ) )
        );

        fstream.on( 'error', callback );
        fstream.on( 'close', function(){
          var data = {
            nmt_id:  nmt.id
          , date:   $query.date
          , size:   +file.size
          };

          var $where = {
            nmt_id: data.id
          , date:   data.date
          };

          db.nmt_hourly_logs.upsert( data, $where, callback );
        });
      });
    });
  };

  ftp.on( 'ready', function(){
    var p = path.join( config.nmt.remoteLeqPath, '*.dat' );

    ftp.list( p, function( error, files ){
      if ( error ) return callback( error );

      utils.async.eachSeries( files, onFile, function( error ){
        if ( error ) return callback( error );
        ftp.end();
      });
    });
  });

  ftp.connect({
    host:     nmt.address
  , user:     nmt.ftp_username
  , password: nmt.ftp_password
  });
};

db.nmts.find({ is_active: true }, function( error, nmts ){
  if ( error ) return onError( error );

  utils.async.each( nmts, onNmtLoaded, function( error ){
    if ( error ) return onError( error );
    process.exit(0);
  });
});