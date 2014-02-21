var fs      = require('fs');
var config  = require('config');

var file = !process.argv[2] ?
  process.stdin : fs.createReadStream( process.argv[2], { start: 2050000 } );

var numTimes = 999999999, curr = 0;
file.on( 'data', function( data ){
  for ( var i = 0, l = data.length - 1; i < l; i++ ){
    if ( data[i] === 0x00 && data[i + 1] === 0x00 && data[i + 2] === 0x00 ){

      var res = data.readDoubleLE( i ) + config.nmt.timestampOffset;
      res = new Date( parseInt( res + '000', 10 ) );

      process.stdout.write('\n\n' + res.toString() + '\n');

      if ( ++curr === numTimes ){
        process.stdout.write('\n');
        process.exit(0);
      }
      i += 7;
      continue;
    }
    if ( data[i] == 1 ) process.stdout.write(', ');
    // else process.stdout.write( data[i].toString() );
    else process.stdout.write(
      (data.readUInt16LE( i ) / 10).toString()
    );
  }
});

file.on( 'close', function(){
  process.stdout.write('\n');
  process.exit(0);
});