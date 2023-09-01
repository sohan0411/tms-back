const db = require('./db');

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
        console.log('Log data inserted into the database');
      }
      next();
    });
}

function fetchLogs(req, res) {
  try {
    const query = 'SELECT * FROM logs';
    db.query(query, (error, rows) => {
      if (error) {
        throw new Error('Error fetching logs');
      }
      res.json({ logs: rows });
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { log, fetchLogs };
