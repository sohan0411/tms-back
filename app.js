const express = require('express');
const cors = require('cors');
const router = require('./routes');
const test = require('./test.js');
const TMS_logs = require('./TMS_Logs.js');
const limitter = require('express-rate-limit');
const http = require('http');
const socketIO = require('socket.io');
const dashboard = require('./dash/dashboard.js');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
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

io.on('connection', (socket) => {
  console.log('A client connected');

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

const port = 3000;
dashboard.initialize(io);

app.use(cors({
  origin: 'http://localhost:4200'
}));
app.use(express.json());
app.use(router);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});