var
  express       = require('express')
, http          = require('http')
, path          = require('path')
, passport      = require('passport')
, LocalStrategy = require('passport-local').Strategy
, db            = require('leto')
, routes        = require('../routes')
, config        = require('../config')
, utils         = require('./utils')
, m             = require('./middleware')
;

var app = module.exports = express();

passport.use(
  new LocalStrategy(
    { usernameField: 'email' }
  , function (email, password, done) {
      db.users.findOne({ email: email }, function (error, user) {
        if (error) return done(error);
        if (!user) return done(null, false, { message: 'Incorrect email.' });

        utils.compareHash(password, user.password, function (error, result) {
          if (error) return done(error);

          if (!result) return done(null, false, { message: 'Incorrect password.' });

          return done(null, user);
        });
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  db.users.findOne(id, done);
});

app.configure(function(){
  app.set('env', config.env);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.use(express.favicon());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'ohai 3NRGC0nsult4nts!' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(m.error);
  app.use(m.cors);
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.use(express.logger('dev'));
});

app.get( '/api/session'
, routes.session.get
);

app.post( '/api/session'
, passport.authenticate('local')
, routes.session.get
);

app.del( '/api/session'
, routes.session.del
);

app.get( '/api/users'
, m.queryObj()
, m.permissions()
, m.queryValidation()
, m.pagination(30)
, routes.generic.find(db.users)
);

app.post( '/api/users'
, m.queryObj()
, m.permissions()
, m.validation()
, m.hash('password')
, routes.generic.insert(db.users)
);

app.get( '/api/users/:id'
, m.queryObj()
, m.permissions()
, m.queryValidation()
, m.param('id')
, routes.generic.findOne(db.users)
);

app.put( '/api/users/:id'
, m.queryObj()
, m.permissions()
, m.validation()
, m.param('id')
, m.returning('*')
, routes.generic.update(db.users)
);

app.del( '/api/users/:id'
, m.queryObj()
, m.permissions()
, m.param('id')
, routes.generic.remove(db.users)
);


app.get( '/api/jobs'
, m.queryObj()
, m.permissions()
, m.queryValidation()
, m.pagination(30)
, routes.generic.find(db.jobs)
);

app.post( '/api/jobs'
, m.queryObj()
, m.permissions()
, m.validation()
, routes.generic.insert(db.jobs)
);

app.get( '/api/jobs/:id'
, m.queryObj()
, m.permissions()
, m.queryValidation()
, m.param('id')
, routes.generic.findOne(db.jobs)
);

app.put( '/api/jobs/:id'
, m.queryObj()
, m.permissions()
, m.validation()
, m.param('id')
, m.returning('*')
, routes.generic.update(db.jobs)
);

app.del( '/api/jobs/:id'
, m.queryObj()
, m.permissions()
, m.param('id')
, routes.generic.remove(db.jobs)
);

app.get( '/api/jobs/:jid/leqs'
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