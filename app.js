
/**
 * Module dependencies.
 */

var
  express = require('express')
, routes  = require('./routes')
, user    = require('./routes/user')
, http    = require('http')
, path    = require('path')
, config  = require('./config')
, db      = require('leto')
, m       = require('./lib/middleware')
;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(m.error)
  app.use(app.router);
  app.use(m.cors)
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get( '/jobs'
, m.queryObj()
, m.permissions()
, m.queryValidation()
, m.pagination(30)
, routes.generic.find(db.jobs)
);

app.post( '/jobs'
, m.queryObj()
, m.permissions()
, m.validation()
, routes.generic.findOne(db.jobs)
);

app.get( '/jobs/:id'
, m.queryObj()
, m.permissions()
, m.queryValidation()
, m.param('id')
, routes.generic.findOne(db.jobs)
);

app.put( '/jobs/:id'
, m.queryObj()
, m.permissions()
, m.validation()
, m.param('id')
, m.returning('*')
, routes.generic.update(db.jobs)
);

app.del( '/jobs/:id'
, m.queryObj()
, m.permissions()
, m.param('id')
, routes.generic.remove(db.jobs)
);

app.get( '/jobs/:jid/leqs'
, m.queryObj()
, m.permissions()
, m.queryValidation()
, m.pagination(120)
, m.sort('-id')
, m.param('jid')
, m.param('duration', 0.5)

  // Start date
, m.param('start', function(query, value){
    if (!query.createdAt) query.createdAt = {};
    query.createdAt.$gte = new Date(value).format( config.db.dateFormat );
  })

  // End date
, m.param('end', function(query, value){
    if (!query.createdAt) query.createdAt = {};
    query.createdAt.$lt = new Date(value).format( config.db.dateFormat );
  })

  // Drain middleware
, function(req, res, next){
    if (req.param('drain') == undefined) return next();
    if (!req.queryObj.id) req.queryObj.id = {};
    req.queryObj.id.$gt = req.param('drain');
    next();
  }

, routes.generic.find(db.leqs)
);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

db.connect()