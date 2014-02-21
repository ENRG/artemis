var config = require('../config');

require('sugar');

var fixtures = module.exports = {
  nmts:   []
, jobs:   []
, leqs:   []
, users:  []
};

fixtures.nmts.push({
  id:         601
, address:    'localhost'
, port:       10001
, is_active:  true
});

fixtures.nmts.push({
  id:         602
, address:    'localhost'
, port:       10002
, is_active:  true
});

// Job: 1
fixtures.jobs.push({
  name:             'Test Job 1'
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
});

// Job: 2
// Used for delete test
fixtures.jobs.push({
  name:             'Test Job 2'
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
});

// Half-second Leqs
(function(){
  var createdAt = Date.create().beginningOfDay().addDays(-1);
  var nmt_id = 601;

  for (var i = 0; i < 1000; i++){
    fixtures.leqs.push({
      nmt_id:     nmt_id
    , db:         46 + (Math.random() * 10)
    , duration:   0.5
    , createdAt:  createdAt.addMilliseconds(500).format(config.db.dateFormat)
    });
  }
})();

// Users: 1
fixtures.users.push({
  jobs: []
, email: "user1@enrgconsultants.com"
, password: "$2a$04$a.sCeR/XiIEADZxPbnVj1eNgzv2kqHO3qoBw20CxpU9uIis0U34Wa"
, passwordSalt: null
, permissions: null
});

// Users: 2
// Used for delete test
fixtures.users.push({
  jobs: []
, email: "user2@enrgconsultants.com"
, password: "$2a$04$a.sCeR/XiIEADZxPbnVj1eNgzv2kqHO3qoBw20CxpU9uIis0U34Wa"
, passwordSalt: null
, permissions: null
});