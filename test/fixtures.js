var config = require('../config');

require('sugar');

var fixtures = module.exports = {
  jobs: []
, leqs: []
};

// Job: 1
fixtures.jobs.push({
  name:           'Test Job 1'
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
});

// Job: 2
// Used for delete test
fixtures.jobs.push({
  name:           'Test Job 2'
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
});

// Half-second Leqs
(function(){
  var createdAt = Date.create().beginningOfDay().addDays(-1);
  var jobId = 1;

  for (var i = 0; i < 1000; i++){
    fixtures.leqs.push({
      jid:        jobId
    , db:         46 + (Math.random() * 10)
    , duration:   0.5
    , createdAt:  createdAt.addMilliseconds(500).format(config.db.dateFormat)
    });
  }
})();