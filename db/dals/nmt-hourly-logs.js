module.exports = {
  name: 'nmt_hourly_logs'

, schema: {
    id:           { type: 'serial', primaryKey: true }
  , nmt_id:       { type: 'int' , references: { table: 'nmts' } }
  , date:         { type: 'int' }
  , size:         { type: 'int' }
  , last_hour:    { type: 'int' }
  , createdAt:    { type: 'timestamp', default: 'now()' }
  }
};