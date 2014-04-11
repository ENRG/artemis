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

  if ( !options.nmt_id ){
    throw new Error('LeqFileToPg.options must contain valid `nmt_id`');
  }

  if ( !options.timestamp_offset ){
    throw new Error('LeqFileToPg.options must contain valid `timestamp_offset`');
  }

  this.nmt_id = options.nmt_id;

  this.options = utils.defaults( options, {

  });

  this.lookingForTs = true;
  this.readingLeqs  = false;
  this.numValues    = 120;

  return this;
}

LeqFileToPg.prototype._transform = function( chunk, encoding, callback ){
  if ( this.buffer ){
    chunk = Buffer.concat([ this.buffer, chunk ]);
    delete this.buffer;
  }

  if ( this.lookingForTs && LeqFileToPg.indexOfTimestamp( chunk ) === -1 ){
    this.buffer = chunk;
    return callback();
  }

  // Process Timestamp
  var i;
  if ( this.lookingForTs ){
    for ( i = LeqFileToPg.indexOfTimestamp( chunk ), l = chunk.length - 1; i < l; i++ ){
      if ( chunk[i] === 0x00 && chunk[i + 1] === 0x00 && chunk[i + 2] === 0x00 ){
        this.currTs = utils.parseNmtDate(
          chunk.readDoubleLE( i ), this.options.timestamp_offset
        );

        this.lookingForTs = false;
        this.readingLeqs = true;

        return this._transform( chunk, encoding, callback );
      }
    }
  }

  // Process LEQs
  var startOfLeqs = LeqFileToPg.indexOfTimestamp( chunk ) + 8;
  if ( this.readingLeqs && LeqFileToPg.endOfLeqsInChunk( chunk, startOfLeqs ) ){
    // Progress to beyond SPLs
    startOfLeqs += this.numValues * 2;

    for ( i = startOfLeqs, l = startOfLeqs + (this.numValues * 2); i < l; i += 2 ){
      if ( this.isValidTime() ){
        this.push(
          new Buffer([
            this.nmt_id
          , 0.5 // Duration
          , this.currTs.format('{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}.{fff}')
          , chunk.readUInt16LE( i ) / 10
          ].join('\t') + '\n')
        );
      }

      if ( this.currTs.format('{ss}.{fff}') === '59.500' ){
        this.emit('eom');
      }

      if ( this.currTs.format('{mm}:{ss}.{fff}') === '59:59.500' ){
        this.emit('eoh');
      }

      if ( this.currTs.format('{HH}:{mm}:{ss}.{fff}') === '23:59:59.500' ){
        this.emit('eod');
      }

      this.currTs = this.currTs.addMilliseconds(500);
    }

    this.readingLeqs = false;
    this.lookingForTs = true;

    return this._transform( chunk.slice( i ), encoding, callback );
  }

  return callback();
};

LeqFileToPg.prototype.isValidTime = function(){
  if ( !this.options.start && !this.options.end ) return true;

  if ( this.options.start ){
    if ( this.options.end ){
      return this.options.start >= this.currTs && this.currTs < this.options.end;
    }

    return this.options.start >= this.currTs;
  }

  if ( this.options.end ){
    return this.currTs < this.options.end;
  }
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

LeqFileToPg.indexOfNextDelimiterGap = function( chunk, offset ){
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

// 3 commas (44) in a row means that's the header
LeqFileToPg.indexOfLeqHeaders = function( chunk, offset ){
  offset = offset || 0;

  if ( chunk.length < offset ){
    throw new Error('Offset was greater than buffer length');
  }

  for ( var i = offset, l = chunk.length - 1; i < l; i++ ){
    if ( chunk[i] === 44 && chunk[i + 2] === 44 && chunk[i + 4] === 44 ){
      return i;
    }
  }

  return -1;
};

LeqFileToPg.headersAreComplete = function( chunk, offset ){
  offset = offset || 0;

  if ( chunk.length < offset ){
    throw new Error('Offset was greater than buffer length');
  }

  var headerPos = LeqFileToPg.indexOfLeqHeaders( chunk, offset );

  if ( headerPos === -1 ) return false;

  for ( var i = headerPos + 1, l = chunk.length - 1; i < l; i++ ){
    if ( chunk [ i - 2 ] === 44 && chunk[ i ] !== 0x01 && chunk[ i ] !== 44 ){
      return true;
    }
  }

  return false;
};


LeqFileToPg.endOfLeqsInChunk = function( chunk, offset ){
  offset = offset || 0;

  if ( chunk.length < offset ){
    throw new Error('Offset was greater than buffer length');
  }

  // 480 = num_spl_vals + num_leq_vals + num_delims
  return chunk.length > offset + 480;
};