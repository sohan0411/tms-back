const db = require('../db');

function logExecution(functionName, tenantId, status, message) {
    const createdTime = new Date().toISOString(); 
    const entity_type = 'SenseLive';
    const entity_id = tenantId; 
    const transport = 'ENABLED'; 
    const db_storage = 'ENABLED'; 
    const re_exec = 'ENABLED'; 
    const js_exec = 'ENABLED';
    const email_exec = 'ENABLED';
    const sms_exec = 'ENABLED'; 
    const alarm_exec = 'ENABLED';
  
    const query = `
      INSERT INTO tmp_api_usage (created_time, tenant_id, entity_type, entity_id, transport, db_storage, re_exec, js_exec, email_exec, sms_exec, alarm_exec, status, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  
    db.query(query, [
      createdTime,
      tenantId,
      entity_type,
      entity_id,
      transport,
      db_storage,
      re_exec,
      js_exec,
      email_exec,
      sms_exec,
      alarm_exec,
      status,
      message,
    ], (error, results) => {
      if (error) {
        console.error(`Error logging execution of function '${functionName}':`, error);
      } else {
        console.log(`Function '${functionName}' executed and logged successfully.`);
      }
    });
  }

function JsLog() {
  const currentTimestamp = new Date().toISOString();
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const query = `
    SELECT COUNT(*) as requestCount
    FROM tmp_api_usage
    WHERE created_time >= ? AND created_time <= ?;
  `;

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return;
    }

    connection.query(query, [fifteenMinutesAgo, currentTimestamp], (error, results) => {
      if (error) {
        console.error('Error querying the database:', error);
        connection.release();
      } else {
        const requestCount = results[0].requestCount;

        const insertQuery = `
          INSERT INTO log_table (timestamp, request_count)
          VALUES (?, ?);
        `;

        connection.query(insertQuery, [currentTimestamp, requestCount], (insertError) => {
          if (insertError) {
            console.error('Error inserting into log_table:', insertError);
          } else {
            console.log('Logged request count successfully:', requestCount);
          }

          connection.release();
        });
      }
    });
  });
}


const interval = 15 * 60 * 1000; 
setInterval(() => {
  JsLog();
}, interval);

module.exports = {logExecution};