var
  config = {}

, _ = require('lodash')

, changeEnvironment = function(env){
    if (env == null || !config.hasOwnProperty(env)) env = 'dev';

    for (var key in module.exports) delete module.exports[key];

    var _config = {};

    _config = _.merge( _.clone(config.default), config[env] );

    for (var key in _config) module.exports[key] = _config[key];

    module.exports.env = env;
    module.exports.changeEnvironment = changeEnvironment;
  }
;

config.default = {

  defaults: {
    limit: 30
  }

, port: 3000

, db: {
    dateFormat: '{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}'
  , connStr:    'postgres://localhost:5432/enrg'
  }
};

config.test = {
  port: 4000
, db: {
    connStr:    'postgres://localhost:5432/enrg-test'
  }
};

config.dev = {
  
};

config.production = {

};

module.exports = {};

changeEnvironment( process.env['ENRG_ARTEMIS_ENV'] );