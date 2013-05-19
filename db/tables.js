module.exports = [
  {
    type: 'create'
  , table: 'users'
  , ifDoesNotExist: true
  , definition: {
      id: {
        type: 'serial'
      , primaryKey: true
      }

    , jobs: {
        type: 'array'
      }

    , email: {
        type: 'text'
      }

    , password: {
        type: 'text'
      }

    , passwordSalt: {
        type: 'text'
      }

    , createdAt: {
        type: 'timestamp'
      }
    }

, {
    type: 'create'
  , table: 'jobs'
  , ifDoesNotExist: true
  , definition: {
      id: {
        type: 'serial'
      , primaryKey: true
      }

    , name: {
        type: 'text'
      }

    , createdAt: {
        type: 'timestamp'
      }
    }
  }

, {
    type: 'create'
  , table: 'leqs'
  , ifDoesNotExist: true
  , definition: {
      id: {
        type: 'serial'
      , primaryKey: true
      }

    , jid: {
        type: 'int'
      , references: 'jobs(id)'
      }

    , db: {
        type: 'double'
      }

    , length: {
        type: 'int'
      }

    , createdAt: {
        type: 'timestamp'
      }
    }
  }

]