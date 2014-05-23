/**
 * Process LEQs
 *
 * Look for gaps between an arbitrary past date and now,
 * fill in gaps.
 */

var fs            = require('fs');
var path          = require('path');
var db            = require('db');
var config        = require('config');
var utils         = require('utils');
var LeqToPgStream = require('../lib/leq-file-to-pg-stream');

var onError = function( error ){
  throw error;
};

var onNmt = function( nmt, callback ){
  // Find gaps between now and a month ago
  var query = {
    start:    new Date().addMonths(-1)
  , end:      new Date()
  , units:    'minute'
  , interval: 10
  , nmt_id:   nmt.id
  };

  db.leqs.findGaps( query, function( error, gaps ){
    if ( error ) return onError( error );

    utils.async.each( gaps, onGap.bind( null, nmt ), callback );
  });
};

var onGap = function( nmt, gap, callback ){
  console.log('Processing gap', gap);

  var curr = gap.start;

  var isNotComplete = function(){
    return curr < gap.end;
  };

  var whilstBody = function( callback ){
    var end = gap.end;

    var file = path.join(
      config.nmt.localLeqPath.replace( ':nmtId', nmt.id )
    , curr.format('{yyyy}{MM}{dd}.dat')
    );

    console.log("Opening file", file);

    fs.exists( file, function( result ){
      if ( !result ) return callback();

      // If the gap spans multiple days, split it up
      if ( end.beginningOfDay().getTime() !== curr.beginningOfDay().getTime() ){
        end = curr.addDays(1).beginningOfDay();
      }

      db.leqs.copy( function( error, cstream ){
        if ( error ) return callback( error );

        var lstream = LeqToPgStream.create({
          nmt_id:           nmt.id
        , start:            curr
        , end:              end
        , timestamp_offset: nmt.timestamp_offset
        });

        var fstream = fs.createReadStream(
          file
        ).pipe(
          lstream
        ).pipe(
          cstream
        ).on(
          'error', callback
        ).on( 'end', function(){
          // Progress current to the end
          curr = end;
          callback();
        });
      });
    });
  };

  utils.async.whilst( isNotComplete, whilstBody, callback );
};

db.init({ noSync: true });

db.nmts.find({ is_active: true }, function( error, nmts ){
  if ( error ) return onError( error );

  utils.async.each( nmts, onNmt, function( error ){
    if ( error ) return onError( error );

    process.exit(0);
  });
});