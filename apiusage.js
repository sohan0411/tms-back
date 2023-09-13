//const db = require('./db');

// function logExecution(functionName, tenantId, status, message) {
//   const createdTime = new Date().toISOString(); 
//   const entity_type = 'TENANT';
//   const entity_id = tenantId; 
//   const transport = 'ENABLED'; 
//   const db_storage = 'ENABLED'; 
//   const re_exec = 'ENABLED'; 
//   const js_exec = 'ENABLED';
//   const email_exec = 'ENABLED';
//   const sms_exec = 'ENABLED'; 
//   const alarm_exec = 'ENABLED';

//   // Insert the log data into your PostgreSQL database
//   const query = `
//     INSERT INTO tmp_api_usage (created_time, tenant_id, entity_type, entity_id, transport, db_storage, re_exec, js_exec, email_exec, sms_exec, alarm_exec, status, message)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
//   `;

//   db.query(query, [
//     createdTime,
//     tenantId,
//     entity_type,
//     entity_id,
//     transport,
//     db_storage,
//     re_exec,
//     js_exec,
//     email_exec,
//     sms_exec,
//     alarm_exec,
//     status,
//     message,
//   ])
//     .then(() => {
//       console.log(`Function '${functionName}' executed and logged successfully.`);
//     })
//     .catch((error) => {
//       console.error(`Error logging execution of function '${functionName}':`, error);
//     });
// }

// module.exports = {
//   logExecution,
// };


const db = require('./db');

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
function apilogs(req, res) {
    try {
      const query = 'SELECT * FROM tmp_api_usage';
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

  function devicelogs(req, res) {
    try {
      const query = 'SELECT * FROM device_info';
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

  function userInfo(req, res) {
    try {
      const query = 'SELECT * FROM user_info';
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
  function companyinfo(req, res) {
    try {
      const query = 'SELECT * FROM company_info';
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

  function alarms(req, res) {
    try {
      const query = 'SELECT * FROM alarms';
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

  function Notification(req, res) {
    try {
      const query = 'SELECT * FROM messages';
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

module.exports = {
  logExecution,
  apilogs,
  devicelogs,
  userInfo,
  companyinfo,
  alarms,
  Notification
};