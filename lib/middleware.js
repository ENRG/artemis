var
  errors  = require('./errors')
, db      = require('leto')
, utils   = require('./utils')
, config  = require('../config')
, less    = require('less-middleware')
, dm      = require('dirac-middleware')
, stdm    = require('stdm')

, m = module.exports = {}
;

utils.extend( m, dm, stdm );

m.less = less;

m.dirac = dm;

m.redirect = function(url){
  return function(req, res){
    res.redirect( url );
  };
};

m.auth = function(){
  var groups = Array.prototype.slice.call( arguments, 0 );
  var options = {};

  if (groups.length > 0 && typeof groups[ groups.length - 1] == 'object') 
    options = groups.pop();

  var fail = function(res){
    if ( options.redirect ) res.redirect( options.redirect );
    else res.error( errors.auth.NOT_AUTHENTICATED );
  };

  return function(req, res, next){
    if ( !req.user || !Array.isArray( req.user.groups ) ) return fail( res );
    if ( !req.user.groups.some(function(g){
      return groups.indexOf( g ) > -1;
    })) return fail( res );

    next();
  };
};

m.applyUser = function(field){
  return function(req, res, next){
    field = field || 'user';
    res.locals.user = req.user;
    next();
  };
};

m.applyJobs = function(){
  return function(req, res, next){
    var $where = {};

    // If user is not an admin, only get jobs they're allowed to see
    if (req.user.jobs.indexOf(-1) == -1)
      $where.id = { $in: req.user.jobs };

    db.jobs.find( $where, function(error, jobs){
      if (error) return res.render('error');

      res.locals.jobs = jobs;

      next();
    });
  };
};

m.cors = function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', req.headers['origin'] || '*'); // req.headers['origin'] is necessary to get authorization to work
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, HEAD, GET, PUT, PATCH, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
  res.setHeader('Access-Control-Expose-Headers', req.headers['access-control-request-headers']);

  // intercept OPTIONS method, this needs to respond with a zero length response (pre-flight for CORS).
  if (req.method === 'OPTIONS') return res.send(204);

  next();
};

m.hash = function(field){
  return function(req, res, next){
    if (!req.body[field]) return next();

    utils.genSalt(config.bcrypt.workFactor, function(error, salt){
      if (error) return res.status(500).end();

      utils.hash(req.body[field], salt, function(error, hash){
        if (error) return res.status(500).end();
        
        req.body[field] = hash;

        next();
      });
    });
  };
};

// m.auth = function(req, res, next){
//   if (!req.session || !req.session.user)
//     return res.error(errors.auth.NOT_AUTHENTICATED);
  
//   next();
// };

m.queryObj = function(){
  return function(req, res, next){
    req.queryObj = {};
    req.queryOptions = {};
    next();
  };
};

m.validation = function(schema){
  return function(req, res, next){
    next();
  };
};

m.queryValidation = function(schema){
  return function(req, res, next){
    next();
  };
};

m.permissions = function(schema){
  return function(req, res, next){
    next();
  };
};