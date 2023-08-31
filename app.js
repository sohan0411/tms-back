const express = require('express');
const cors = require('cors');
const router = require('./routes');
const limitter = require('express-rate-limit');
const fs = require('fs');
const logMiddleware = require('./logger');
// const mqtt_pub = require('./pub');
// const mqtt_sub = require('./sub');
// const MinuteData = require('./dash/interval_min');
// const hourData = require('./dash/interval_hour');
// const weekData = require('./dash/interval_week');
// const dayData = require('./dash/interval_day');
// const MonthData = require('./dash/interval_month');
const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());
app.use(logMiddleware);
// Log middleware
app.use((req, res, next) => {
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
});

// Use the router for handling routes
app.use(router);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



// const express = require('express');
// const cors = require('cors');
// const router = require('./routes');
// const test = require('./test.js');
// const TMS_logs = require('./TMS_Logs.js');
// const limitter = require('express-rate-limit');
// const http = require('http');
// const Socket = require('./socket');


// const app = express();
// /*
// app.use(limitter({
//   windowMS : 5000,
//   max:5,
//   message:{
//     code: 429,
//     message:'Too many request'
//   }
// })) 
// */
// const server = http.createServer(app);

// Socket(server);



// const port = 3000;

// app.use(cors());
// app.use(express.json());
// app.use(router);

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
