var
  express       = require('express')
, http          = require('http')
, path          = require('path')
, passport      = require('passport')
, LocalStrategy = require('passport-local').Strategy
, db            = require('db')
, routes        = require('../routes')
, config        = require('../config')
, utils         = require('./utils')
, m             = require('./middleware')
;

require('./hbt-helpers');

var app = module.exports = express();

module.exports.init = function(){
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser( db.users.findOne.bind( db.users ) );

  app.configure(function(){
    app.set('env', config.env);
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'hbs');
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.cookieParser('ohai 3NRGC0nsult4nts!'));
    app.use(express.cookieSession());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.methodOverride());
    app.use(m.error());
    app.use(m.less({
      src:      __dirname + '/../public'
    , compress: false
    , force:    true
    }));
    app.use(express.static(path.join(__dirname, '/../public')));
    app.use(m.dirac({ envelope: true }));
    app.use(app.router);


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
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
    app.use(express.logger('dev'));
  });

  app.get( '/users'
  , m.view( 'users', db.users )
  );

  app.get( '/', m.redirect('/login') );

  app.get( '/panel'
  , m.auth('admin', 'client', { redirect: '/login' })
  , m.applyJobs()
  , m.applyUser()
  , m.view('panel')
  );

  app.get( '/jobs/:id'
  , m.auth('admin', 'client', { redirect: '/login' })
  , m.applyJobs()
  , m.applyUser()
  , function( req, res, next ){ res.locals.jobId = req.param('id'); next(); }
  , m.view('panel')
  );

  app.get('/no-jobs', function( req, res ){
    res.send('no jobs');
  });


  app.get( '/login'
  , m.view('login')
  );

  app.post( '/login'
  , function( req, res ){
      passport.authenticate('local', function( s, user, error ){
        if ( error ) return res.render( 'login', { error: error } );

        if ( user.jobs.length ){
          console.log('redirecting to', '/jobs/' + user.jobs[0].id);
          return res.redirect( '/jobs/' + user.jobs[0].id );
        }
        
        res.redirect('/no-jobs');
      })( req, res );
    }
  );

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
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
  , m.permissions()
  , m.queryValidation()
  , m.pagination(30)
  , m.find(db.users)
  );

  app.post( '/api/users'
  , m.permissions()
  , m.validation()
  , m.hash('password')
  , m.insert(db.users)
  );

  app.get( '/api/users/:id'
  , m.permissions()
  , m.queryValidation()
  , m.param('id')
  , m.findOne(db.users)
  );

  app.put( '/api/users/:id'
  , m.permissions()
  , m.validation()
  , m.param('id')
  , m.returning('*')
  , m.update(db.users)
  );

  app.del( '/api/users/:id'
  , m.permissions()
  , m.param('id')
  , m.remove(db.users)
  );

  app.get( '/api/jobs'
  , m.permissions()
  , m.queryValidation()
  , m.pagination(30)
  , m.find(db.jobs)
  );

  app.post( '/api/jobs'
  , m.permissions()
  , m.validation()
  , m.insert(db.jobs)
  );

  app.get( '/api/jobs/:id'
  , m.permissions()
  , m.queryValidation()
  , m.param('id')
  , m.findOne(db.jobs)
  );

  app.put( '/api/jobs/:id'
  , m.permissions()
  , m.validation()
  , m.param('id')
  , m.returning('*')
  , m.update(db.jobs)
  );

  app.del( '/api/jobs/:id'
  , m.permissions()
  , m.param('id')
  , m.remove(db.jobs)
  );

  app.get( '/api/jobs/:jid/leqs'
  , m.permissions()
  , m.queryValidation()

    // Ensure the route gets the correct view
  , function( req, res, next ){
      req.collection = db.dals[ [ 'job', req.param('jid'), 'leqs' ].join('_') ];
      next();
    }

  , m.pagination(120)
  , m.sort('-id')
  , m.param('duration', 0.5)

    // Start date
  , m.param('start', function(value, query){
      query.createdAt = query.createdAt || {};
      query.createdAt.$gte = query.createdAt.$gte || [];
      query.createdAt.$gte.push(
        new Date(value).format( config.db.dateFormat )
      );
    })

    // End date
  , m.param('end', function(value, query){
      if (!query.createdAt) query.createdAt = {};
      query.createdAt.$lt = new Date(value).format( config.db.dateFormat );
    })

    // Drain - gets the rest of the leqs i.e. id > greatest_id_on_client
  , m.param('drain', function(value, query){
      if (!query.id) query.id = {};
      query.id.$gt = value;
    })

  , m.find()
  );
};
