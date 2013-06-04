var
  util    = require('util')
, config  = {}
, env     = process.env['INSULTS_ENV'] || 'dev';

config.default = {

  defaults: {
    limit: 30
  }

, db: {
    dateFormat: '{yyyy}-{MM}-{dd} {hh}:{mm}:{ss}'
  }
};

config.dev = {
  
};

config.production = {

};

if (env == null || !config.hasOwnProperty(env)) env = 'dev';

module.exports = util._extend(config.default, config[env]);

console.log('Loading ' + env + ' config');