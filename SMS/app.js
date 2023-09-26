const express = require('express');
const bodyParser = require('body-parser');
const { checkState } = require('./smsController');

const app = express();
const port = process.env.PORT || 3000;

// Set 'ejs' as the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: false }));

// Endpoint to trigger sending SMS
app.post('/send-notification', (req, res) => {
  checkState();
  res.send('SMS sending process initiated.');
});

// Assuming 'devices' array is returned by the checkState function
app.get('/devices', (req, res) => {
  const devices = checkState();
  res.render('device-status', { devices }); // Pass the 'devices' array to the EJS template
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Periodically check the state every 1
setInterval(checkState,1000);
