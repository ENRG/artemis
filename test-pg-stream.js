var fs            = require('fs');
var LeqToPgStream = require('./lib/leq-file-to-pg-stream');

var file = !process.argv[2] ?
  process.stdin : fs.createReadStream( process.argv[2] );

file.pipe(
  LeqToPgStream.create({ nmt_id: 506 })
).pipe(
  process.stdout
);