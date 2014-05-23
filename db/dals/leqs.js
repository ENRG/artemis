var dirac = require('dirac');
var utils = require('utils');

module.exports = {
  name: 'leqs'

, schema: {
    id: {
      type: 'serial'
    , primaryKey: true
    }

  , nmt_id: {
      type: 'int'
    , references: {
        table: 'nmts'
      , column: 'id'
      }
    }

  , db: {
      type: 'double precision'
    }

  , duration: {
      type: 'double precision'
    }

  , createdAt: {
      type: 'timestamp'
    , default: 'now()'
    }
  }

, find: function($query, options, callback){
    if (typeof options == 'function'){
      callback = options;
      options = {};
    }
    
    dirac.DAL.prototype.find.call(this, $query, options, function(error, results){
      if (error) return callback ? callback(error) : null;

      // Cast all string doubles to numbers
      for (var i = 0, l = results.length; i < l; ++i){
        results[i].db = +results[i].db;
        results[i].duration = +results[i].duration;
      }

      if (callback) callback(null, results);
    });
  }

, findGaps: function( query, callback ){
    utils.defaults( query, {
      interval: 10
    , unit: 'minute'
    });

    var $query = {
      with: []
    , type: 'union'
    , queries: []
    };

    // Query for the current gap
    $query.with.push({
      type: 'select'
    , table: this.table
    , name: 'curr'
    , columns: [
        { expression: 'now() - "createdAt"',  alias: 'duration' }
      , { expression: 'now()',  alias: 'end' }
      , { name: 'createdAt', alias: 'start'}
      ]
    , order: { id: 'desc' }
    , limit: 1
    });

    $query.queries.push({
      type: 'select'
    , columns: [
        { table: 'pairs', name: 'gap',                  alias: 'duration' }
      , { table: 'pairs', name: 'createdAt',            alias: 'end' }
      , { expression: 'pairs."createdAt" - pairs.gap',  alias: 'start' }
      ]
    , table: {
        type: 'select'
      , alias: 'pairs'
      , table: this.table
      , columns: [
          'createdAt', 'nmt_id'
        , { expression: '"createdAt" - lag( "createdAt" ) over w', alias: 'gap' }
        ]
      , window: {
          name: 'w'
        , as: { order: { 'createdAt': 'asc' } }
        }
      }
    , where: {
        'pairs.gap': {
          $custom: [ 'pairs.gap > \'' + query.interval + ' ' + query.unit + '\'::interval' ]
        }
      , 'pairs.start': {
          $custom: [ 'pairs."createdAt" - pairs.gap >= $1', query.start ]
        }
      }
    });

    $query.queries.push({
      type: 'select'
    , table: 'curr'
    , columns: ['*']
    });

    return this.query( $query, callback );
  }
};