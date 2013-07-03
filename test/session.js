var assert = require('assert');
var utils  = require('../lib/utils');
var db     = require('leto');

describe('/api/session', function(){
  describe('POST /api/session', function(){
    it('should return session', function(done){
      var user = {
        email: "user1@enrgconsultants.com"
      , password: "password"
      };

      utils.api.post('/api/session', user, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(!!results.data, true);
        assert.equal(results.data.email, user.email);
        utils.api.del('/api/session', done);
      });
    });

    it('should return a 401 for bad creds', function(done){
      var user = {
        email: "user1aaaaaaaaa@enrgconsultants.com"
      , password: "password"
      };

      utils.api.post('/api/session', user, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 401);
        done();
      });
    });
  });

  describe('GET /api/session', function(){
    it('should return session', function(done){
      var user = {
        email: "user1@enrgconsultants.com"
      , password: "password"
      };

      utils.api.post('/api/session', user, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(!!results.data, true);
        assert.equal(results.data.email, user.email);

        utils.api.get('/api/session', function(error, response, results){
          assert.equal(!error, true);
          assert.equal(response.statusCode, 200);

          assert.equal(!!results.data, true);
          assert.equal(results.data.email, user.email);

          utils.api.del('/api/session', done);
        });
      });
    });
  });

  describe('DEL /api/session', function(){
    it('should clear session', function(done){
      var user = {
        email: "user1@enrgconsultants.com"
      , password: "password"
      };

      utils.api.post('/api/session', user, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(!!results.data, true);
        assert.equal(results.data.email, user.email);

        utils.api.del('/api/session', function(error, response, results){
          assert.equal(!error, true);
          assert.equal(response.statusCode, 204);

          utils.api.get('/api/session', function(error, response, results){
            assert.equal(!error, true);
            assert.equal(response.statusCode, 204);
            done();
          });
        });
      });
    });
  });
});