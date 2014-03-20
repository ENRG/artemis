#!/usr/bin/env node

var program         = require('commander');
var fs              = require('fs');
var db              = require('db');
var CombinedStream  = require('combined-stream')
var LeqToPgStream   = require('../lib/leq-file-to-pg-stream');
var config          = require('config');

require('sugar');

program
  .usage('[options]')
  .version('1.0.0')
  .option('-f, --file <path>',  'Path to data file')
  .option('-n, --nmt <id>',     'ID of the NMT to use')
  .option('-b, --begin <date>', 'Start date', Date.create )
  .option('-e, --end <date>',   'End date', Date.create )
  .option('-s, --stdout',       'Only output to stdout (good for testing)')
  .option('--read-start <n>')
  .option('--read-end <n>')
  .parse( process.argv );

db.init({ noSync: true });

var source;

// Multiple file streams needed
if (
  program.begin && program.end &&
  program.begin.clone().beginningOfDay() < program.end.clone().beginningOfDay()
){
  source = CombinedStream.create();
} else if ( program.file ){
  if ( !fs.existsSync( program.file ) ){
    throw new Error( 'Cannot find file: ' + program.file );
  }

  var options = {};

  // Advance the fstream read pointer to the start of
  // the chunk we actually want to read
  if ( program.begin ){
    options.start = program.begin.getHours() * 60;
    options.start += program.begin.getMinutes();
    options.start *= config.nmt.datMinSize;
  }

  // Only read up to the specified end
  if ( program.end ){
    options.end = program.end.getHours() * 60;
    options.end += program.end.getMinutes();
    options.end *= config.nmt.datMinSize;
  }

  // Let --read-start/end take precedence
  if ( program.readStart ) options.start = +program.readStart;
  if ( program.readEnd ) options.end = +program.readEnd;

  source = fs.createReadStream( program.file, options );
} else {
  source = process.stdin;
}

(function( next ){
  if ( program.stdout ) return next( process.stdout );

  var options = {
    columns: [ 'nmt_id', 'duration', 'createdAt', 'db' ]
  };

  db.leqs.copy( options, function( error, cstream ){
    if ( error ) throw error;

    next( cstream );
  });
})(function( target ){
  source.on( 'end', function(){
    process.exit(0);
  });

  source.on( 'error', function( error ){
    throw error;
  });

  source.pipe(
    LeqToPgStream.create({
      nmt_id: program.nmt
    })
  ).pipe( target );
});