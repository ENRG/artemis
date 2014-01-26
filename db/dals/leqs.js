var dirac = require('dirac');

module.exports = {
  name: 'leqs'

, schema: {
    id: {
      type: 'serial'
    , primaryKey: true
    }

  , jid: {
      type: 'int'
    , references: {
        table: 'jobs'
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
};