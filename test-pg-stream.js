var fs            = require('fs');
var db            = require('db');
var LeqToPgStream = require('./lib/leq-file-to-pg-stream');

// (
//   !process.argv[2] ?
//     process.stdin : fs.createReadStream( process.argv[2] )
// ).pipe(
//   LeqToPgStream.create({ nmt_id: 506 })
// ).pipe(
//   process.stdout
// );

db.init({ noSync: true });

var options = {
  columns: [ 'nmt_id', 'duration', 'createdAt', 'db' ]
};

db.leqs.copy( options, function( error, cstream ){
  if ( error ) throw error;

  var fstream = (
    !process.argv[2] ?
      process.stdin : fs.createReadStream( process.argv[2] )
  ).pipe(
    LeqToPgStream.create({ nmt_id: 506 })
  ).pipe(
    cstream
  ).on( 'end', function(){
    process.exit(0);
  }).on( 'error', function( error ){
    throw error;
  });
});