#!/usr/bin/env node

var db = require('db');
db.init();
setTimeout( function(){
  process.exit(0);
}, 1400)