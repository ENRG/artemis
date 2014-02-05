var assert = require('assert');
var utils  = require('../lib/utils');
var db     = require('db');

require('sugar');

describe('/api/jobs', function(){
  describe('GET /jobs', function(){
    it('should return jobs', function(done){
      utils.api.get('/api/jobs', function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.length > 0, true);

        results.data.forEach(function(job){
          for (var key in db.jobs.schema){
            assert.equal(key in job, true);
          }
        });

        done();
      });
    });
  });

  describe('GET /jobs/:jobId', function(){
    it('should return a job', function(done){
      var jobId = 1;
      utils.api.get('/api/jobs/' + jobId, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.id, jobId);

        for (var key in db.jobs.schema){
          assert.equal(key in results.data, true);
        }

        done();
      });
    });

    it('should return a 400', function(done){
      var jobId = 'not a valid job id';
      utils.api.get('/api/jobs/' + jobId, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 400);

        done();
      });
    });

    it('should return a 404', function(done){
      var jobId = 999999999;
      utils.api.get('/api/jobs/' + jobId, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 404);

        done();
      });
    });
  });

  describe('POST /jobs', function(){
    it('should create a job', function(done){
      var job = {
        name:             'Test Job Alpha'
      , lat:              0
      , lon:              0
      , company:          'ENRG Consultants'
      , ambient:          50
      , allowable_day:    5
      , allowable_night:  3
      , threshold_1:      5
      , threshold_2:      10
      , threshold_3:      15
      , is_active:        false
      , nmt_id:           601
      };

      utils.api.post('/api/jobs', job, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.id > 0, true);

        done();
      });
    });
  });

  describe('PUT /jobs/:jobId', function(){
    it('should update a job', function(done){
      var jobId = 1;

      var job = {
        is_active: true
      };

      utils.api.put('/api/jobs/' + jobId, job, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);


        assert.equal(results.data.id, jobId);
        assert.equal(results.data.is_active, true);

        done();
      });
    });

    it('should 404', function(done){
      var jobId = 99999999;

      var job = {
        is_active: true
      };

      utils.api.put('/api/jobs/' + jobId, job, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 404);
        done();
      });
    });
  });

  describe('DEL /jobs/:jobId', function(){
    it('should delete a job', function(done){
      var jobId = 2;
      utils.api.del('/api/jobs/' + jobId, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 204);
        done();
      });
    });
  });
});