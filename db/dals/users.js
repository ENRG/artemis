module.exports = {
  name: 'users'

, schema: {
    id: {
      type: 'serial'
    , primaryKey: true
    }

  , jobs: {
      type: 'int[]'
    , default: "Array[]::int[]"
    , expandReferences: {
        table: 'jobs'
      , column: 'id'
      }
    }

  , groups: {
      type: 'text[]'
    , default: "Array[]::text[]"
    }

  , email: {
      type: 'text'
    , unique: true
    }

  , password: {
      type: 'text'
    }

  , passwordSalt: {
      type: 'text'
    }

  , permissions: {
      type: 'int'
    }

  , createdAt: {
      type: 'timestamp'
    , default: 'now()'
    }
  }
};