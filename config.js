var
  config = {}

, _ = require('lodash')

, changeEnvironment = function(env){
    if (env === null || !config.hasOwnProperty(env)) env = 'dev';

    for (var key in module.exports) delete module.exports[key];

    var _config = {};

    _config = _.merge( _.clone(config.default), config[env] );

    for (key in _config) module.exports[key] = _config[key];

    module.exports.env = env;
    module.exports.changeEnvironment = changeEnvironment;
  }
;

config.default = {

  defaults: {
    limit: 30
  }

, port: process.env.ENRG_HTTP_PORT || 3000

, db: {
    dateFormat: '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}'
  , connString: 'postgres://localhost:5432/enrg'
  }

, bcrypt: {
    workFactor: 4
  }

, nmt: {
    remoteLeqPath:    '/NMT/NMTDATA/MINUTE'
  , localLeqPath:     './data/:nmtId/minute'
  , datMinSize:       1448
  }
};

config.test = {
  port: 4000
, db: {
    dateFormat: '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}'
  , connString: 'postgres://localhost:5432/enrg_test'
  }
};

config.dev = {
  
};

config.production = {

};

module.exports = {};

changeEnvironment( process.env.ENRG_ARTEMIS_ENV );
