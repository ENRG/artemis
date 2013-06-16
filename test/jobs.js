var assert = require('assert');
var utils  = require('../lib/utils');
var db     = require('leto');

describe('/jobs', function(){
  describe('GET /jobs', function(){
    it('should return jobs', function(done){
      utils.api.get('/jobs', function(error, response, results){
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
      utils.api.get('/jobs/' + jobId, function(error, response, results){
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
      utils.api.get('/jobs/' + jobId, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 400);

        done();
      });
    });

    it('should return a 404', function(done){
      var jobId = 999999999;
      utils.api.get('/jobs/' + jobId, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 404);

        done();
      });
    });
  });

  describe('POST /jobs', function(){
    it('should create a job', function(done){
      var job = {
        name:           'Test Job Alpha'
      , lat:            0
      , lon:            0
      , company:        'ENRG Consultants'
      , ambient:        50
      , allowableDay:   5
      , allowableNight: 3
      , threshold1:     5
      , threshold2:     10
      , threshold3:     15
      , isActive:       false
      , nmt: {
          id:           601
        , address:      '601.enrgnmt.com'
        , password:     'bk4441'
        }
      };

      utils.api.post('/jobs', job, function(error, response, results){
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
        isActive: true
      };

      utils.api.put('/jobs/' + jobId, job, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);


        assert.equal(results.data.id, jobId);
        assert.equal(results.data.isActive, true);

        done();
      });
    });

    it('should 404', function(done){
      var jobId = 99999999;

      var job = {
        isActive: true
      };

      utils.api.put('/jobs/' + jobId, job, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 404);
        done();
      });
    });
  });

  describe('DEL /jobs/:jobId', function(){
    it('should delete a job', function(done){
      var jobId = 2;
      utils.api.del('/jobs/' + jobId, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 204);
        done();
      });
    });
  });
});