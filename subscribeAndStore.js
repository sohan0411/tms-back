const mqtt = require('mqtt');
const mysql = require('mysql2');
const moment = require('moment-timezone');

// MySQL database connection details
const dbOptions = {
  host: 'senselivedb.cn5vfllmzwrp.ap-south-1.rds.amazonaws.com',
  user: 'admin',
  password: 'sense!123',
  database: 'tmp'
};

// MQTT broker details
const brokerOptions = {
  host: '13.232.24.140',
  port: 1883,
  username: 'Sense2023',
  password: 'sense123',
  clientId: 'mqtt-subscriber'
};

// Topic to subscribe to
const topic = 'Sense/Live/#';

// Create MySQL connection pool
const pool = mysql.createPool(dbOptions);

// Create an MQTT client
const client = mqtt.connect(brokerOptions);

// Callback when the client is connected
client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Subscribe to the specified topic
  client.subscribe(topic, (err) => {
    if (!err) {
      console.log(`Subscribed to topic: ${topic}`);
    }
  });
});

// Callback when a message is received
client.on('message', (receivedTopic, message) => {
  // Convert the message to a string
  const messageString = message.toString();

  // Remove the DeviceUID field from the payload string
  const cleanedMessageString = messageString.replace(/"DeviceUID":\s*"[^"]+",?/, '"');

  // Parse the cleaned payload into JSON
  const data = JSON.parse(cleanedMessageString);

  // Extract the last part of the received topic as DeviceUID
  const topicParts = receivedTopic.split('/');
  const deviceUID = topicParts[topicParts.length - 1];

  // Get the current timestamp in the Indian timezone in the desired format
  const timestamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

  // Construct an array of values to be inserted into the database
  const values = [
    deviceUID,  // Use the extracted DeviceUID
    data.TemperatureR || null,
    data.TemperatureY || null,
    data.TemperatureB || null,
    data.Humidity || null,
    timestamp  // Use the current timestamp
  ];

  // Construct the SQL query dynamically based on the available values
  const placeholders = Array(values.length).fill('?').join(', ');
  const columns = ['DeviceUID', 'TemperatureR', 'TemperatureY', 'TemperatureB', 'Humidity', 'TimeStamp'].join(', ');

  const sql = `INSERT INTO actual_data (${columns}) VALUES (${placeholders})`;

  // Insert the received data into the database
  pool.query(sql, values, (error, results, fields) => {
    if (error) {
      console.error(`Error inserting data into the database: ${error}`);
    } else {
      console.log(`Data inserted successfully into the database`);
    }
  });
});


// Callback when an error occurs
client.on('error', (error) => {
  console.error(`Error: ${error}`);
});
