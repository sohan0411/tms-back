const express = require('express');
const cors = require('cors');
const router = require('./routes');
const fs = require('fs');
const bodyParser = require('body-parser');
const SA = require('./superadmin/SA');
const auditlogs = require('./graph/graph log');
const Logs2 = require('./graph/graph_sms');
const Logs3 = require('./graph/graph');
const userCount = require('./graph/userCount');
const deviceCount = require('./graph/devcount');
const comp = require('./graph/comp');
const TMS_logs = require('./tms_trigger_logs');
//const checkState = require('./SMS/smsController');

/*               Interval                */

// const MinuteData = require('./dash/interval_min');
// const hourData = require('./dash/interval_hour');
// const weekData = require('./dash/interval_week');
// const dayData = require('./dash/interval_day');
// const MonthData = require('./dash/interval_month');
/*                 MQTT                  */
// const mqtt_sub = require('./sub');
// const mqtt_pub = require('./pub');
const app = express();

const port = 3000;


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(auditlogs.log);

// Use the router for handling routes
app.use(router);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

