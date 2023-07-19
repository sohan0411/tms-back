const WebSocket = require('ws');
const db = require('../db');

function startWebSocketServer() {
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on('connection', (ws) => {
    console.log('WebSocket connection established.');

    const interval = setInterval(() => {
      fetchCompanyUserStatus(ws); // Call the function to fetch and send user data
    }, 5000); // Update every 5 seconds

    ws.on('close', () => {
      console.log('WebSocket connection closed.');
      clearInterval(interval); // Stop updating when the connection is closed
    });
  });
}

function fetchCompanyUserStatus(ws) {
  try {
    const query = 'SELECT UserId, is_online FROM tms_users';
    db.query(query, (error, users) => {
      if (error) {
        throw new Error('Error fetching users');
      }

      // Send the users data to the client via WebSocket
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(users));
      }
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
  }
}

module.exports = { startWebSocketServer };
