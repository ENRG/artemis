var NmtSocket = require('./lib/nmt-stream2');

var nmt1 = new NmtSocket({
  address:  '501.enrgnmt.com'
, port:     10001
, password: 'enrg501'
});

nmt1.on( 'leq', function( leq ){
  console.log( leq );
});

nmt1.on( 'error', function( error ){
  throw error;
});

nmt1.connect( function( error ){
  if ( error ) throw error;

  nmt1.login( function( error ){
    if ( error ) throw error;

    nmt1.enterRealTime();
  });
});