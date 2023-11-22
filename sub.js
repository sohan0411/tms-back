const mqtt = require('mqtt');
const mysql = require('mysql2');
const os = require('os');

// MQTT broker URL
const broker = 'ws://broker.emqx.io:8083/mqtt';

// MySQL configuration
const mysqlConfig = {
    host: 'senselivedb.cn5vfllmzwrp.ap-south-1.rds.amazonaws.com',
        user: 'admin',
        password: 'sense!123',
        database: 'tmp',
  port: 3306, // MySQL default port is 3306
};

// Create a MySQL connection pool
const mysqlPool = mysql.createPool(mysqlConfig);

// Fetch the local IP address
const localIpAddress = getLocalIpAddress();

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    const iface = interfaces[key];
    for (const item of iface) {
      if (item.family === 'IPv4' && !item.internal) {
        return item.address;
      }
    }
  }
  return 'Unknown'; // Return 'Unknown' if no IP address is found
}

console.log('Local IP Address:', localIpAddress);

// Connect to the MQTT broker
const mqttClient = mqtt.connect(broker);

// Handle MQTT connection event
mqttClient.on('connect', () => {
  //console.log('Connected to MQTT broker');

  for (let i = 50; i <= 62; i++) {
    const deviceId = `SL022023${i}`;
    const topic = `sense/live/${deviceId}`;
    mqttClient.subscribe(topic, (error) => {
      if (error) {
        console.error(`Error subscribing to ${topic}:`, error);
      } else {
       // console.log(`Subscribed to ${topic}`);
      }
    });
  }
});

mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message);

    const insertQuery = `
    INSERT INTO actual_data (DeviceUID, Temperature, Timestamp, TemperatureR, TemperatureY, TemperatureB, Humidity,ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      data.DeviceUID,
      data.Temperature,
      data.Timestamp,
      data.TemperatureR,
      data.TemperatureY,
      data.TemperatureB,
      data.Humidity,
      localIpAddress,
    ];

    mysqlPool.query(insertQuery, insertValues, (error) => {
      if (error) {
        console.error('Error inserting data into MySQL:', error);
      } else {
       // console.log('Data inserted into MySQL');
      }
    });
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

process.on('exit', () => {
  mysqlPool.end();
});
