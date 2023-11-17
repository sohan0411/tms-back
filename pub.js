const mqtt = require('mqtt');

// MQTT broker URL
const brokerUrl = 'ws://broker.emqx.io:8083/mqtt';

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function generateRandomData(deviceId) {
  const DeviceUID = deviceId;
  const Temperature = getRandomNumber(35, 50).toFixed(1);
  const Humidity = getRandomNumber(40, 70).toFixed(1);
  const TemperatureR= getRandomNumber(35, 50).toFixed(1);
  const TemperatureY= getRandomNumber(35, 50).toFixed(1);
  const TemperatureB = getRandomNumber(35, 50).toFixed(1);
  const Timestamp = new Date().toISOString();

  const data = {
    DeviceUID,
    Temperature,
    Humidity,
    TemperatureR,
    TemperatureY,
    TemperatureB,
    Timestamp
  };

  return JSON.stringify(data);
}
const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  for (let i = 1; i <= 9; i++) {
    const deviceId = `SL0120230${i}`;
    const topic = `sense/live/${deviceId}`;

    setInterval(() => {
      const message = generateRandomData(deviceId);
      client.publish(topic, message);
    }, 2000);
  }
});

client.on('error', (error) => {
  console.error('MQTT error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Closing MQTT connection.');
  client.end();
  process.exit();
});
