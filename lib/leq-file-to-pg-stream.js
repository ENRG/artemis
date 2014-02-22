/**
 * Minute LEQ File Stream
 */

var util    = require('util');
var Stream  = require('stream');
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

  var defaults = {
    bufferSize: 2048
  };

  for ( var key in defaults ){
    if ( !(key in options) ) options[key] = defaults[key];
  }

  this.buffer = new Buffer( options.bufferSize );
  this.pos = 0;
}

LeqFileToPg.prototype._transform = function( chunk, encoding, callback ){
  var data = this.buffer, rest, leq, currTs, tillEnd;

  // First, copy what we can from chunk to our internal buffer
  // If our buffer is too small to handle the chunk, save that data
  // in a new buffer to be dealt with later
  if ( this.buffer.length - this.pos < chunk.length ){
    rest = chunk.slice( this.buffer.length - this.pos );

    if ( this.rest ) this.rest = Buffer.concat( this.rest, rest );
    else this.rest = rest;

    chunk.copy( this.buffer, this.pos, 0, this.buffer.length - this.pos );
  } else {
    chunk.copy( this.buffer, this.pos );
  }

  if ( !LeqFileToPg.chunkIsProcessable( data ) ) return callback();

  for ( var i = 0, l = data.length - 1; i < l; i++ ){
    if ( data[i] === 0x00 && data[i + 1] === 0x00 && data[i + 2] === 0x00 ){
      currTs = data.readDoubleLE( i ) + config.nmt.timestampOffset;
      currTs = new Date( parseInt( currTs + '000', 10 ) );

      // Progress to SPL values
      i += 7;

      // spl/leqs should be the same number, so this will be divisible
      // by 2. There will also always be an odd amount of delimiters `,`
      // and since this indexOf is `0`-based, then we can just divide
      // by 2 to get to the position of where the regular LEQs start
      tillEnd = LeqFileToPg.indexOfNextCommaGap( chunk.slice( i ) );
      i += tillEnd / 2;

      // Make it so we navigate from i up to tillEnd
      tillEnd = (tillEnd * 2) + i;

      continue;
    }

    if ( data[i] == 1 ) continue;

    currTs = currTs.addMilliseconds(500);
    leq = data.readUInt16LE( i ) / 10;

    this.push(
      new Buffer([
        this.nmt_id
      , currTs.format('{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}.{fff}')
      , leq
      ].join('\t') + '\n')
    );

    if ( i === tillEnd ){
      i += LeqFileToPg.indexOfTimestamp( chunk.slice( i ) );

      // indexOf was -1 so it was EOF
      if ( i < tillEnd ) break;
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

LeqFileToPg.indexOfNextCommaGap = function( chunk ){
  var distance = 0;

  for ( var i = 0, l = chunk.length - 1; i < l; i++ ){
    if ( chunk[i] === 0x01 ) distance = 0;
    else distance++;

    if ( distance === 2 ) return i - 1;
  }

  return -1;
};

LeqFileToPg.indexOfTimestamp = function( chunk ){
  for ( var i = 0, l = chunk.length - 1; i < l; i++ ){
    if ( chunk[i] === 0x00 && chunk[i + 1] === 0x00 && chunk[i + 2] === 0x00 ){
      return i;
    }
  }

  return -1;
};