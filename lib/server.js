var
  express = require('express')
, routes  = require('../routes')
, http    = require('http')
, path    = require('path')
, config  = require('../config')
, db      = require('leto')
, m       = require('./middleware')
;

var app = module.exports = express();

app.configure(function(){
  app.set('env', config.env);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(m.error)
  app.use(m.cors)
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.use(express.logger('dev'));
});

app.get( '/users'
, m.queryObj()
, m.permissions()
, m.queryValidation()
, m.pagination(30)
, routes.generic.find(db.users)
);

app.get( '/users'
, m.queryObj()
, m.permissions()
, m.queryValidation()
, m.pagination(30)
, routes.generic.find(db.users)
);

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
, routes.generic.insert(db.jobs)
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

  // Drain - gets the rest of the leqs i.e. id > greatest_id_on_client
, m.param('drain', function(query, value){
    if (!query.id) query.id = {};
    query.id.$gt = value;
  })

, routes.generic.find(db.leqs)
);