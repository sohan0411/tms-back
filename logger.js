const fs = require('fs');

function logMiddleware(req, res, next) {
  const { method, url, body } = req;
  const timestamp = new Date().toISOString();
  const entity = body.userType || 'User';
  const entityName = body.companyName || 'SenseLive';
  const user = req.body.Username || req.body.companyEmail || 'N/A'; 
  const userType = req.body.designation || 'N/A'; 
  const type = body.type || 'N/A';
  const status = res.statusCode >= 200 && res.statusCode < 400 ? 'successful' : 'failure';
  const details = '...';

  const logMessage = `${timestamp} | Entity Type: ${entity} | Entity Name: ${entityName} | User: ${user} (${userType}) | Type: ${url} | Status: ${status} | Details: ${details} | ${method}`;

  const formattedLogMessage = `
==========================================================================================================================================
${logMessage}
------------------------------------------------------------------------------------------------------------------------------------------
  `;

  fs.appendFile('log.txt', formattedLogMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

  next();
}

module.exports = logMiddleware;
