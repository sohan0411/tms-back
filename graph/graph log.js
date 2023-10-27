const db = require('../db');

function extractIPv4(ipv6MappedAddress) {
    const parts = ipv6MappedAddress.split(':');
    return parts[parts.length - 1];
  }

function log(req, res, next) {
    const { method, url, body, ip } = req;
    const timestamp = new Date().toISOString();
    const entity = body.userType || 'User';
    const entityName = body.companyName || 'SenseLive';
    const user = req.body.Username || req.body.companyEmail || 'N/A';
    const userType = req.body.designation || 'std';
    const type = method; 
    const status = res.statusCode >= 200 && res.statusCode < 400 ? 'successful' : 'failure';
    const details = `URL: ${url}`;
    
    const ipv4Address = extractIPv4(ip);
  
    const logMessage = `${timestamp} | IP: ${ipv4Address} | Entity Type: ${entity} | Entity Name: ${entityName} | User: ${user} (${userType}) | Type: ${type} | Status: ${status} | Details: ${details}`;
  
    db.query('INSERT INTO tmp.logs (timestamp, ip, entity_type, entity_name, username, user_type, request_type, status, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [timestamp, ipv4Address, entity, entityName, user, userType, type, status, details],
      function (error, results) {
        if (error) {
          console.error('Error writing to database:', error);
        } else {
          //console.log('Log data inserted into the database');
        }
        next();
      });
  }

function monitorLogsAndLogCount() {
  const currentTimestamp = new Date().toISOString();
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const query = `
    SELECT COUNT(*) as requestCount
    FROM tmp.logs
    WHERE timestamp >= ? AND timestamp <= ?;
  `;

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return;
    }

    connection.query(query, [fifteenMinutesAgo, currentTimestamp], (error, results) => {
      if (error) {
        console.error('Error querying the database for request count:', error);
        connection.release();
      } else {
        const requestCount = results[0].requestCount;

        const insertQuery = `
          INSERT INTO log_count_table (timestamp, request_count)
          VALUES (?, ?);
        `;

        connection.query(insertQuery, [currentTimestamp, requestCount], (insertError) => {
          if (insertError) {
            console.error('Error inserting request count into log_count_table:', insertError);
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
  monitorLogsAndLogCount();
}, interval);

module.exports = {log};