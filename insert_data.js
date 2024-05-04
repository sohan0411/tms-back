const mysql = require('mysql2/promise');
const mqtt = require('mqtt');

const pool = mysql.createPool({
  host: '52.66.107.247',
  user: 'senselive',
  password: 'sense123',
  database: 'vert',
  connectionLimit: 10, // Adjust as needed
});

const broker = 'ws://65.2.127.156:9001';
const options = {
  username: 'Sense2023', // Replace with your MQTT broker username
  password: 'sense123', // Replace with your MQTT broker password
};

const mqttClient = mqtt.connect(broker, options);
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('#', (error) => {
    if (error) {
      console.error('Error subscribing to topics:', error);
    } else {
      console.log('Subscribed to topic');
    }
  });
});

mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

mqttClient.on('message', (topic, message) => {
  try {
    const data = message.toString();
    processAndInsertData(data);
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

async function processAndInsertData(topicData) {
  let connection;

  try {
    connection = await pool.getConnection();

    const data = JSON.parse(topicData);
    const deviceUID = data.DeviceUID || data.device_uid;
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

    delete data.DeviceUID;

    const placeholders = Object.keys(data).map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const values = Object.entries(data).flatMap(([key, value]) => {
      if (typeof value === 'boolean') {
        return [timestamp, deviceUID, key, value, null, null, null, null, null];
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          return [timestamp, deviceUID, key, null, value, null, null, null, null];
        } else {
          return [timestamp, deviceUID, key, null, null, value, null, null, null];
        }
      } else if (typeof value === 'string') {
        return [timestamp, deviceUID, key, null, null, null, value, null, null];
      } else if (typeof value === 'object') {
        return [timestamp, deviceUID, key, null, null, null, null, JSON.stringify(value), null];
      } else {
        // Handle other data types accordingly
        return [timestamp, deviceUID, key, null, null, null, null, null, null];
      }
    });

    // console.log(values);

    const insertQuery = `INSERT INTO vert.data_veri (date_time, device_uid, key_data, bool_data, int_data, float_data, varchar_data, text_data, json_data) VALUES ${placeholders}`;

    // Execute the batch insert
    await connection.query(insertQuery, values);

    // console.log('Inserted successfully!');
  } catch (error) {
    console.error('Error processing and inserting data:', error);
  } finally {
    if (connection) {
      connection.release(); // Release the connection back to the pool
    }
  }
}

