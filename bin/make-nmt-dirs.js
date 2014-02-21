/*
  create directories for local storage of leq & third octave data
 */

var mkdirp  = require('mkdirp');
var path    = require('path');
var config  = require('config');

[
  501
, 502
, 503
, 504
, 505
, 506
, 507
, 508
].forEach( function( id ){
  var
  leqDir = config.nmt.localLeqPath.replace( ':nmtId', id )
, thirdOctaveDir = config.nmt.localThirdOctavePath.replace( ':nmtId', id )
;
  leqDir = path.join( __dirname, '../', leqDir );
  thirdOctaveDir = path.join( __dirname, '../', thirdOctaveDir );

  mkdirp.sync( leqDir );
  mkdirp.sync( thirdOctaveDir );
});
