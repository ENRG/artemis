module.exports = {
  name: 'nmts'

, schema: {
    id: {
      type: 'int'
    , primaryKey: true
    }
  , address: {
      type: 'text'
    }
  , port: {
      type: 'int'
    , default: 10001
    }
  , password: {
      type: 'text'
    , default: "'bk4441'"
    }
  , ftp_password: {
      type: 'text'
    , default: "'1235813'"
    }
  , ftp_username: {
      type: 'text'
    , default: "'admin'"
    }
  , is_active: {
      type: 'boolean'
    , default: false
    }
  , createdAt: {
      type: 'timestamp'
    , default: 'now()'
    }
  }
};