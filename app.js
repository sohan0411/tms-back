const express = require('express');
const cors = require('cors');
const router = require('./routes');
const limitter = require('express-rate-limit');
const fs = require('fs');
const bodyParser = require('body-parser');
const auditlogs = require('./superadmin/SA');
// const mqtt_sub = require('./sub');
// const mqtt_pub = require('./pub');
const dev = require('./dev');
const comp = require('./comp');
const TMS_logs = require('./tms_trigger_logs');

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

app.use(limitter({
  windowMS : 5000,
  max:50,
  message:{
    code: 429,
    message:'Too many request'
  }
})) 

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
