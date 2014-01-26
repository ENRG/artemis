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
  , online: {
      type: 'boolean'
    , default: false
    }
  , createdAt: {
      type: 'timestamp'
    , default: 'now()'
    }
  }
};