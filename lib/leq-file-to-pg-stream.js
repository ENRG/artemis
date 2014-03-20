/**
 * Minute LEQ File Stream
 */

var util    = require('util');
var Stream  = require('stream');
var utils   = require('utils');
var config  = require('config');

require('sugar');

util.inherits( LeqFileToPg, Stream.Transform );

module.exports = LeqFileToPg;
module.exports.create = function( options ){
  return new LeqFileToPg( options );
};

function LeqFileToPg( options ){
  options = options || {};

  Stream.Transform.call( this, options );

  if ( !options.nmt_id )
    throw new Error('LeqFileToPg.options must contain valid `nmt_id`');

  this.nmt_id = options.nmt_id;

  this.options = utils.defaults( options, {

  });

  return this;
}

LeqFileToPg.prototype._transform = function( chunk, encoding, callback ){
  var tillEnd, iot;

  // If we previously had data that was too small of a chunk
  // to process, concatenate now
  var data = Buffer.concat([ this.buffer || new Buffer(0), chunk ]);

  // If chunk is too small to process, save for later
  if ( !LeqFileToPg.chunkIsProcessable( data ) ){
    this.buffer = data;
    return callback();
  }

  // Buffer now back in processible data, no need to keep around
  delete this.buffer;

  for ( var i = LeqFileToPg.indexOfTimestamp( data ), l = data.length - 1; i < l; i++ ){
    // Skip delimiters
    if ( data[i] == 1 ) continue;

    if ( data[i] === 0x00 && data[i + 1] === 0x00 && data[i + 2] === 0x00 ){
      this.currTs = utils.parseNmtDate( data.readDoubleLE( i ) );

      // Progress to SPL values
      i += 7;

      // spl/leqs should be the same number, so this will be divisible
      // by 2. There will also always be an odd amount of delimiters `,`
      tillEnd = LeqFileToPg.indexOfNextCommaGap( data, i + 1 );

      if ( tillEnd === -1 ){
        this.buffer = data.slice( i - 7 );
        return callback();
      }

      // The distance from i to next comma gap _should_ be an even
      // number since there should be a the same amount of sql/leqs  
      // Just in case it's not, round
      i += parseInt( (tillEnd - i) / 2 );

      continue;
    }

    this.push(
      new Buffer([
        this.nmt_id
      , 0.5 // Duration
      , this.currTs.format('{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}.{fff}')
      , data.readUInt16LE( i ) / 10
      ].join('\t') + '\n')
    );

    console.log('val:', data.readUInt16LE(i), data.readUInt16LE(i+1), data.readUInt16LE(i+2), data.readUInt16LE(i+3), data.readUInt16LE(i+4), data.readUInt16LE(i+5))
    this.currTs = this.currTs.addMilliseconds(500);

    if ( i >= tillEnd - 2 ){
      iot = LeqFileToPg.indexOfTimestamp( data, i + 1 );

      // No longer processible
      if ( iot === -1 ) break;

      return this._transform(
        data.slice( LeqFileToPg.indexOfTimestamp( data, i + 1 ) )
      , encoding
      , callback
      );
    }
  }

  callback();
};

/**
 * Whether or not there is a timestamp followed by octets
 * separated by commas, and then followed by multiple octets
 * that are not separated by commas
 * @param  {Buffer} chunk 
 * @return {Boolean}
 */
LeqFileToPg.chunkIsProcessable = function( chunk ){
  // foundTs indicates where or not we've found a timestamp yet
  // distance indicates how far it's been since the last comma
  var foundTs = false, distance = 0;

  for ( var i = 0, l = chunk.length - 1; i < l; i++ ){
    if ( !foundTs ){
      if ( chunk[i] === 0x00 && chunk[i + 1] === 0x00 && chunk[i + 2] === 0x00 ){
        foundTs = true;
      }
    } else {
      if ( chunk[i] === 0x01 ) distance = 0;
      else distance++;

      if ( distance >= 2 ) return true;
    }
  }

  return false;
};

LeqFileToPg.indexOfNextCommaGap = function( chunk, offset ){
  offset = offset || 0;

  if ( chunk.length < offset ){
    throw new Error('Offset was greater than buffer length');
  }

  var distance = 0;

  for ( var i = offset, l = chunk.length - 1; i < l; i++ ){
    if ( chunk[i] === 0x01 ) distance = 0;
    else distance++;

    if ( distance === 2 ) return i - 1;
  }

  return -1;
};

LeqFileToPg.indexOfTimestamp = function( chunk, offset ){
  offset = offset || 0;

  if ( chunk.length < offset ){
    throw new Error('Offset was greater than buffer length');
  }

  for ( var i = offset, l = chunk.length - 1; i < l; i++ ){
    if ( chunk[i] === 0x00 && chunk[i + 1] === 0x00 && chunk[i + 2] === 0x00 ){
      return i;
    }
  }

  return -1;
};