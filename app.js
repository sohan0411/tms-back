const express = require('express');
const cors = require('cors');
const router = require('./routes');
const test = require('./test.js');
const TMS_logs = require('./TMS_Logs.js');
const limitter = require('express-rate-limit');


const app = express();
/*
app.use(limitter({
  windowMS : 5000,
  max:5,
  message:{
    code: 429,
    message:'Too many request'
  }
})) 
*/

const port = 3000;

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
