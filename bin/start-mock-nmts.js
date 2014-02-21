#!/usr/bin/env node

var program = require('commander');
var db      = require('db');
var config  = require('config');
var pkg     = require('../package.json');
var MockNmt = require('p4441-stream').MockServer;

program
  .version(pkg.version)
  .parse(process.argv);

config.changeEnvironment('test');

db.init();

db.nmts.find( {}, function( error, results ){
  if ( error ) throw error;

  results.forEach( function( nmt ){
    new MockNmt( nmt ).listen();
  });
});