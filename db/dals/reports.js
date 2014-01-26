module.exports = {
  name: 'reports'

, schema: {
    id: {
      type: 'serial'
    , primaryKey: true
    }

  , jid: {
      type: 'int'
    , references: {
        table: 'jobs'
      , column: 'id'
      }
    }

  , leqs: {
      type: 'double precision[]'
    }

  , mins: {
      type: 'double precision[]'
    }

  , maxs: {
      type: 'double precision[]'
    }

  , ooc1: {
      type: 'double precision[]'
    }

  , ooc2: {
      type: 'double precision[]'
    }

  , ooc3: {
      type: 'double precision[]'
    }

  , reportDate: {
      type: 'timestamp'
    , default: 'now()'
    }

  , createdAt: {
      type: 'timestamp'
    , default: 'now()'
    }
  }
};