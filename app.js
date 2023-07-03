const express = require('express');
const cors = require('cors');
const router = require('./routes');
/*const autoScript = require('./auto.js');*/

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
