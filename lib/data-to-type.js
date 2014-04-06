/**
 * Minute To UInt8
 */

var util    = require('util');
var Stream  = require('stream');
var utils   = require('utils');
var config  = require('config');

util.inherits( DataToType, Stream.Transform );

module.exports = DataToType;
module.exports.create = function( options ){
  return new DataToType( options );
};

function DataToType( options ){
  options = options || {};

  Stream.Transform.call( this, options );

  this.options = utils.defaults( options, {
    type: 'UInt16LE'
  });

  return this;
}

DataToType.prototype._transform = function( chunk, encoding, callback ){
  for ( var i = 0, l = chunk.length - 1; i < l; i++ ){
    if ( chunk[i] === 0x00 && chunk[i + 1] === 0x00 && chunk[i + 2] === 0x00 ){
      this.push( new Buffer('\n\n') );
      this.push( utils.parseNmtDate( chunk.readDoubleLE( i ) ) + '  ' );
    }

    if ( chunk[i] === 0x01 && false ){
      this.push(',');
    } else {
      this.push( chunk[ 'read' + this.options.type ]( i ).toString() + ' ' );
    }
  }

  callback();
};