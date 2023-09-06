const express = require('express');
const cors = require('cors');
const router = require('./routes');
const limitter = require('express-rate-limit');
const fs = require('fs');
const bodyParser = require('body-parser');
const audit_logs = require('./audit_logs');
const mqtt_pub = require('./pub');
const mqtt_sub = require('./sub');
const TMS_logs = require('./TMS_Logs.js');
// const MinuteData = require('./dash/interval_min');
// const hourData = require('./dash/interval_hour');
// const weekData = require('./dash/interval_week');
// const dayData = require('./dash/interval_day');
// const MonthData = require('./dash/interval_month');
const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(audit_logs.log)


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
