var assert = require('assert');
var utils  = require('../lib/utils');
var config = require('../config');
var db     = require('leto');

require('sugar');

describe('/jobs/:jobId/leqs', function(){
  describe('GET', function(){

    it('should return leqs', function(done){
      var jobId = 1;
      utils.api.get('/jobs/' + jobId + '/leqs', function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.length > 0, true);

        results.data.forEach(function(leq){
          assert.equal(leq.jid, jobId);
          for (var key in db.leqs.schema){
            assert.equal(key in leq, true);
          }
        });

        done();
      });
    });

    it('should return leqs id desc by default', function(done){
      var jobId = 1;
      utils.api.get('/jobs/' + jobId + '/leqs', function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.length > 0, true);

        for (var i = 1; i < results.data.length; i++){
          assert.equal(results.data[i - 1].id > results.data[i].id, true)
        }

        done();
      });
    });

    it('should return leqs after a date', function(done){
      var jobId = 1;
      var createdAt = Date.create().beginningOfDay().addDays(-1).addSeconds(250);

      utils.api.get('/jobs/' + jobId + '/leqs?start=' + createdAt.format(config.db.dateFormat), function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.length > 0, true);

        results.data.forEach(function(leq){
          assert.equal(new Date(leq.createdAt) > createdAt, true);
        });

        done();
      });
    });

    it('should return leqs before a date', function(done){
      var jobId = 1;
      var createdAt = Date.create().beginningOfDay().addDays(-1).addSeconds(250);

      utils.api.get('/jobs/' + jobId + '/leqs?end=' + createdAt.format(config.db.dateFormat), function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.length > 0, true);

        results.data.forEach(function(leq){
          assert.equal(new Date(leq.createdAt) < createdAt, true);
        });

        done();
      });
    });

    it('should return leqs between two dates', function(done){
      var jobId = 1;
      var start = Date.create().beginningOfDay().addDays(-1).addSeconds(100);
      var end = Date.create().beginningOfDay().addDays(-1).addSeconds(150);
      var url = '/jobs/' + jobId + '/leqs'
              + '?start=' + start.format(config.db.dateFormat)
              + '&end=' + end.format(config.db.dateFormat);

      utils.api.get(url, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.length > 0, true);
        results.data.forEach(function(leq){
          var d = new Date(leq.createdAt);
          assert.equal(d >= start && d < end, true);
        });

        done();
      });
    });

    it('should drain leqs', function(done){
      var jobId = 1, drain = 500;
      utils.api.get('/jobs/' + jobId + '/leqs?drain=' + drain, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.length > 0, true);

        assert.equal(results.data[results.data.length - 1].id > drain, true)

        for (var i = 1; i < results.data.length; i++){
          assert.equal(results.data[i - 1].id > results.data[i].id, true)
        }

        done();
      });
    });

  });
});