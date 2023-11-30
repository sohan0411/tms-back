const mqtt = require('mqtt');

// MQTT broker details
const brokerOptions = {
  host: 'dashboard.senselive.in',
  port: 1883,
  username: 'Sense2023',
  password: 'sense123',
  clientId: 'mqtt-subscriber12345676' // Set a unique client ID
};

// Topic to subscribe to
const topic = '#';

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
  console.log(`Received message on topic ${receivedTopic}: ${message.toString()}`);
});

// Callback when an error occurs
client.on('error', (error) => {
  console.error(`Error: ${error}`);
});
