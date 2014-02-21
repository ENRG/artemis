var utils = require('utils');

// Ensures all jobs have corresponding job_{id}_leqs views
module.exports = function( dirac ){
  var concernedFields = [
    'nmt_id'
  , 'start_date'
  , 'end_date'
  ];

  var registerJobView = function( job ){
    dirac.register({
      name: [ 'job', job.id, 'leqs' ].join('_')
    , type: 'view'
    , query: {
        type: 'select'
      , table: 'leqs'
      , where: {
          nmt_id: job.nmt_id
        , createdAt: {
            $gte: job.start_date
          , $lt:  job.end_date
          }
        }
      }
    });
  };

  dirac.dals.jobs.find( {}, function( error, jobs ){
    if ( error ) throw error; // TODO

    jobs.forEach( registerJobView );
    dirac.createViews();
  });

  // Ensure nmt_id is also returned on inserts
  dirac.dals.jobs.before( 'insert', function( $query, schema, next ){
    if ( !$query.returning ){
      $query.returning = [ 'id' ].concat( concernedFields );
    } else {
      concernedFields.forEach( function( f ){
        if ( $query.returning.indexOf( f ) === -1 ) $query.returning.push( f );
      });
    }

    next();
  });

  // After a job insert, register a job view
  dirac.dals.jobs.after( 'insert', function( results, $query, schema, next ){
    results.forEach( registerJobView );

    dirac.createViews( next );
  });
};