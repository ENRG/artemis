var assert = require('assert');
var utils  = require('../lib/utils');
var db     = require('db');

describe('/api/users', function(){
  describe('GET /api/users', function(){
    it('should return users', function(done){
      utils.api.get('/api/users', function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.length > 0, true);

        results.data.forEach(function(user){
          for (var key in db.users.schema){
            assert.equal(key in user, true);
          }
        });

        done();
      });
    });
  });

  describe('POST /api/users', function(){
    it('should return users', function(done){

      var user = {
        email: "test" + Math.random() * 9999999 + "@enrgconsultants.com"
      , password: 'password'
      };

      utils.api.post('/api/users', user, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.id > 0, true);

        done();
      });
    });
  });

  describe('GET /api/users/:userId', function(){
    it('should return a user', function(done){
      var userId = 1;
      utils.api.get('/api/users/' + userId, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.id, userId);

        for (var key in db.users.schema){
          assert.equal(key in results.data, true);
        }

        done();
      });
    });

    it('should return 404', function(done){
      var userId = 1111111111;
      utils.api.get('/api/users/' + userId, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 404);
        done();
      });
    });
  });

  describe('PUT /api/users/:userId', function(){
    it('should update a user', function(done){
      var userId = 1;
      var user = {
        email: 'testaaaaaaaaaaa@enrgconsultants.com'
      };

      utils.api.put('/api/users/' + userId, user, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 200);

        assert.equal(results.data.id, userId);
        assert.equal(results.data.email, user.email);

        done();
      });
    });

    it('should return 404', function(done){
      var userId = 1111111111;
      var user = {
        email: 'testaaaaaaaaaaa@enrgconsultants.com'
      };
      utils.api.put('/api/users/' + userId, user, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 404);
        done();
      });
    });
  });

  describe('DEL /api/users/:userId', function(){
    it('should delete a user', function(done){
      var userId = 2;
      utils.api.del('/api/users/' + userId, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 204);

        done();
      });
    });

    it('should return 404', function(done){
      var userId = 1111111111;
      utils.api.del('/api/users/' + userId, function(error, response, results){
        assert.equal(!error, true);
        assert.equal(response.statusCode, 404);
        done();
      });
    });
  });
});