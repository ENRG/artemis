var
  util    = require('util')
, msql    = require('mongo-sql')
, request = require('request')
, async   = require('async')
, bcrypt  = require('bcrypt')
, lodash  = require('lodash')
, ftp     = require('ftp')
, config  = require('../config')
, utils   = module.exports = {}
;

require('sugar');

for (var key in util) utils[key] = util[key];

utils           = lodash.extend(utils, lodash);
utils.sql       = msql.sql;
utils.request   = request;
utils.async     = async;
utils.FtpClient = ftp;

utils.hash        = bcrypt.hash;
utils.compareHash = bcrypt.compare;
utils.genSalt     = bcrypt.genSalt;

utils.noop = function(){};

utils.parseNmtDate = function( d, offset ){
  return new Date( parseInt( ( d + offset ) + '000', 10 ) );
};

utils.queryParams = function(data){
  if (typeof data !== "object") return "";
  var params = "?";
  for (var key in data){
    if (Array.isArray(data[key])){
      for (var i = 0, l = data[key].length; i < l; ++i){
        params += key + "[]=" + data[key][i] + "&";
      }
    } else {
      params += key + "=" + data[key] + "&";
    }
  }
  return params.substring(0, params.length - 1);
};

utils.get = function(url, params, callback){
  if (typeof params == 'function'){
    callback = params;
    params = null;
  }

  if (params) url += utils.queryParams(params);

  request({
    method: 'GET'
  , url: url
  , json: true
  }, callback);
};

utils.post = function(url, data, callback){
  if (typeof data == 'function'){
    callback = data;
    data = {};
  }

  request({
    method: 'POST'
  , url: url
  , json: data
  }, callback);
};

utils.put = function(url, data, callback){
  if (typeof data == 'function'){
    callback = data;
    data = {};
  }

  request({
    method: 'PUT'
  , url: url
  , json: data
  }, callback);
};

utils.del = function(url, callback){
  request({
    method: 'DELETE'
  , url: url
  , json: true
  }, callback);
};

utils.api = {};

utils.api.get = function(url, params, callback){
  utils.get('http://localhost:' + config.port + url, params, callback);
};

utils.api.post = function(url, data, callback){
  utils.post('http://localhost:' + config.port + url, data, callback);
};

utils.api.put = function(url, data, callback){
  utils.put('http://localhost:' + config.port + url, data, callback);
};

utils.api.del = function(url,  callback){
  utils.del('http://localhost:' + config.port + url,  callback);
};