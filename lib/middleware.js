var
  errors  = require('./errors')
, db      = require('leto')
, utils   = require('./utils')
, config  = require('../config')
, less    = require('less-middleware')

, m = module.exports = {}
;

m.less = less;

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

m.log = function(){
  var args = Array.prototype.slice.call( arguments, 0 );
  return function(req, res, next){
    console.log.apply(console, ["Log:"].concat(
      args.map(function(a){ return req[a]; })
    ));
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

m.logQuery = function(){
  return function(req, res, next){
    console.log(req.queryObj);
    console.log(req.queryOptions);
    next();
  };
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
}

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
  }
};

m.sort = function(_sort){
  return function(req, res, next){
    var direction = "desc", sort = req.param('sort') || _sort;

    if (sort[0] == '+')
      direction = "asc";

    req.queryOptions.order = sort.substring(1) + " " + direction;

    next();
  }
};

m.param = function(field, def, fn){
  if (typeof def == 'function') fn = def, def = null;

  return function(req, res, next){
    var value = req.param(field) || def;

    if (value == undefined || value == null) return next();

    if (typeof fn == 'function') fn(req.queryObj, value);
    else req.queryObj[field] = value;
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

m.pagination = function(limit, offset){
  offset = offset || 0;

  return function(req, res, next){
    req.queryOptions.offset = req.param('offset') || offset;
    req.queryOptions.limit = req.param('limit') || limit;

    next();
  };
};

m.returning = function(){
  var args = Array.prototype.slice.call(arguments, 0);
  return function(req, res, next){
    if (args.length == 0) return next();

    if (req.queryOptions.returning)
      req.queryOptions.returning = req.queryOptions.returning.concat(args);
    else
      req.queryOptions.returning = [].concat(args);

    next();
  };
}

m.error = function(req, res, next){
  res.error = function(error){
    if (typeof error == 'number') return res.status(error).end();

    if (!error.httpCode) error.httpCode = 400;
    res.status(error.httpCode).json(error);
  };

  next();
};