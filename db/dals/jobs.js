module.exports = {
  name: 'jobs'

, schema: {
    id: {
      type: 'serial'
    , primaryKey: true
    }
  , name: {
      type: 'text'
    }
  , lat: {
      type: 'double precision'
    }
  , lon: {
      type: 'double precision'
    }
  , company: {
      type: 'text'
    }
  , ambient: {
      type: 'double precision'
    }
  , allowable_day: {
      type: 'double precision'
    }
  , allowable_night: {
      type: 'double precision'
    }
  , threshold_1: {
      type: 'double precision'
    }
  , threshold_2: {
      type: 'double precision'
    }
  , threshold_3: {
      type: 'double precision'
    }
  , is_active: {
      type: 'boolean'
    }
  , nmt_id: {
      type: 'int'
    , references: { table: 'nmts', column: 'id' }
    }
  , created_at: {
      type: 'timestamp'
    , default: 'now()'
    }
  }

, createHourlyReport: function(jobId, callback){
    var createReport = function(callback){
      // Query leqs by job up to
      var $query = {
        jid: jobId
      , createdAt: {
          $gte: Date.now().format('{yyyy}-{MM}-{dd} 00:00:00')
        , $lt:  Date.now().advance({ day: 1 }).format('{yyyy}-{MM}-{dd} 00:00:00')
        }
      };

      db.leqs.find($query, function(error, results){
        if (error) return callback(error);

        results.map(utils.toPascals).reduce(function(p, c){
          return p + c;
        });
      });
    };

    utils.stage({
      'start': function(next){
        next('check if record exists')
      }

    , 'check if record exists': function(next, done){
        var $query = {
          jid: jobId
        , reportDate: Date.now().format('{yyyy}-{MM}-{dd}')
        };

        db.reports.findOne($query, function(error, result){
          if (error) return done(error);

          if (!result)  next('create record');
          else          next('update record', result);
        });
      }

    , 'create record': function(next, done){
        createReport(function(error, results){
          if (error) return done(error);

          db.reports.insert()
        });
      }
    })(callback);
  }
};