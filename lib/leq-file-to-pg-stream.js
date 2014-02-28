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
  var leq, tillEnd, iot;

  // Copy what we can from chunk to our internal buffer
  // If our buffer is too small to handle the chunk, save that data
  // in a new buffer to be dealt with later
  if ( this.buffer.length - this.pos < chunk.length ){
    if ( this.rest ){
      this.rest = Buffer.concat([ this.rest, chunk.slice( this.buffer.length - this.pos ) ]);
    } else {
      this.rest = chunk.slice( this.buffer.length - this.pos );
    }

    console.log('Copying to pos', this.pos, 0, chunk.length - this.pos)
    chunk.copy( this.buffer, this.pos, 0, chunk.length - this.pos );
  } else {
    chunk.copy( this.buffer, this.pos );
  }

  if ( !LeqFileToPg.chunkIsProcessable( this.buffer ) ) return callback();

  for ( var i = 0, l = this.buffer.length - 1; i < l; i++ ){
    if ( this.buffer[i] === 0x00 && this.buffer[i + 1] === 0x00 && this.buffer[i + 2] === 0x00 ){
      this.currTs = this.buffer.readDoubleLE( i ) + config.nmt.timestampOffset;
      this.currTs = new Date( parseInt( this.currTs + '000', 10 ) );

      // Progress to SPL values
      i += 7;

      // spl/leqs should be the same number, so this will be divisible
      // by 2. There will also always be an odd amount of delimiters `,`
      // and since this indexOf is `0`-based, then we can just divide
      // by 2 to get to the position of where the regular LEQs start
      tillEnd = LeqFileToPg.indexOfNextCommaGap( chunk.slice( i + 1 ) );
console.log("TS Found", this.currTs, "at", i, "relative end is", tillEnd)
console.log('Progressing i by', tillEnd / 2)
      i += tillEnd / 2;

      // Make it so we navigate from i up to tillEnd
      tillEnd += i - (tillEnd / 2) + 1;
      this.pos += i;
      console.log('tillEnd is', tillEnd)
      continue;
    }

    this.pos += i;

    if ( this.buffer[i] == 1 ) continue;

    leq = this.buffer.readUInt16LE( i ) / 10;

    this.push(
      new Buffer([
        i
      , this.nmt_id
      , this.currTs.format('{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}.{fff}')
      , leq
      ].join('\t') + '\n')
    );

    this.currTs = this.currTs.addMilliseconds(500);

    if ( i >= tillEnd - 2 ){
      console.log("End of LEQs at", tillEnd, "adding", LeqFileToPg.indexOfTimestamp( chunk.slice( i ) ));
      iot = LeqFileToPg.indexOfTimestamp( chunk.slice( i + 1 ) );
      tillEnd = 0;

      // EOF
      if ( iot === -1 ) break;

      // Reached the end of the internal buffer
      if ( i + iot > this.buffer.length ){
        return
      }

      i += iot;
    }
  }

  this.buffer
  this.pos = 0;

  if ( this.rest ){
    var rest = this.rest;
    delete this.rest;
    return this._transform( rest, encoding, callback );
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