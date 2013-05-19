var
  util  = require('util')
, pg    = require('pg')
, msql  = require('mongo-sql')

, utils = module.exports = {}
;

for (var key in util) utils[key] = util[key];

utils.Class = function(d){
  d.constructor.extend = function(def){
    for (var k in d) if (!def.hasOwnProperty(k)) def[k] = d[k];
    return utils.Class(def);
  };
  return (d.constructor.prototype = d).constructor;
};

utils.sql = msql.sql;

utils.DataAccess = {};

utils.DataAccess.Collection = utils.Class({
  constructor: function(table, options){
    this.table = table;
    this.options = options;
    return this;
  }

, query: function(query, callback){
    pg.query( utils.sql(query), function(error, result){
      if (error) return callback(error);

      if (query.type != 'select' && query.returning)
        return callback(null, result.rows);

      if (query.type == 'select')
        return callback(null, result.rows);

      callback();
    });

    return this;
  }

, insert: function(values, callback){
    var query = {
      type: 'insert'
    , table: this.table
    , values: values
    , returning: ['id']
    };

    return this.query(query, callback);
  }

, find: function(where, options, callback){
    if (typeof options == 'function'){
      callback = options;
      options = {};
    }

    var query = {
      type: 'select'
    , table: this.table
    , where: where
    };

    for (var key in options) query[key] = options[key];

    return this.query(query, callback);
  }

, findOne: function(id, where, callback){
    if (typeof options == 'function'){
      callback = options;
      options = {};
    }

    var query = {
      type: 'select'
    , table: this.table
    , where: where
    , limit: 1
    };

    for (var key in options) query[key] = options[key];

    return this.query(query, callback);
  }

, remove: function(id){
    var query = {
      type: 'delete'
    , table: this.table
    , where: typeof id == 'object' ? id : { id: id }
    , returning: ['id']
    };

    return this.query(query, callback);
  }
});