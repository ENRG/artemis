var fixtures = module.exports = {
  jobs: []
};

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