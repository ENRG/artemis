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

var onGap = function( gap, callback ){
  var curr = gap.start;

  var file = path.join(
    config.nmt.dataPath
  , gap.nmt_id
  , curr.format('YYYYMMdd.dat')
  );

  var isNotComplete = function(){
    return curr < gap.end;
  };

  var whilstBody = function( callback ){
    var end = gap.end;

    // If the gap spans multiple days,
    // we need to properly split it up
    if ( end.beginningOfDay().getTime() !== curr.beginningOfDay().getTime() ){
      end = curr.endOfDay();
    }

    db.nmt_leqs.copy( function( error, copyStream ){
      if ( error ) return callback( error );

      var fstream = fs.createReadStream( file ).pipe(
        LeqToPgStream.create({ nmt_id: gp.nmt_id })
      ).pipe(
        copyStream
      );
    });

  };

  fs.exists( file, function( result ){
    if ( !result ) return callback();

    async.whilst( isNotComplete, whilstBody, callback );
  });
};

// Find gaps between now and a month ago
var start = new Date().addMonths(-1);
var end   = new Date();

db.nmt_leqs.findGaps( start, end, function( error, gaps ){
  if ( error ) return onError( error );

  // Aggregate each gap by day
  var daysGaps = gaps.groupBy( function( gap ){
    return gap.start.format('YYYYMMdd');
  });

  var onDay = function( day, callback ){
    return async.each( day, onGap, callback );
  };

  async.each( Object.keys( daysGaps ), onDay, function( error ){
    if ( error ) return onError( error );

    process.exit(0);
  });
});