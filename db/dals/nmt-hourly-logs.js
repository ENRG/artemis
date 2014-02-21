module.exports = {
  name: 'nmt_hourly_logs'

, schema: {
    id:           { type: 'serial', primaryKey: true }
  , nmt_id:       { type: 'int' , references: { table: 'nmts' } }
  , date:         { type: 'int' }
  , size:         { type: 'int' }
  , last_hour:    { type: 'int' }
  , log_type:     { type: 'text' }
  , createdAt:    { type: 'timestamp', default: 'now()' }
  }
};