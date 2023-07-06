const db = require('./db');

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function testData() {
  for (let i = 1; i <= 9; i++) {
    const DeviceUID = `SL0120230${i}`;
    const Temperature = getRandomNumber(35, 50).toFixed(2);
    const Humidity = getRandomNumber(40, 70).toFixed(2);
    const Timestamp = new Date().toISOString();

    const data = {
      DeviceUID,
      Temperature,
      Humidity,
      Timestamp
    };

    const entry = "INSERT INTO actual_data SET ?";
    db.query(entry, data, (error, results) => {
      if (error) {
        console.log("Error while inserting data", error);
      } else {
        console.log("Data inserted successfully!");
      }
    });
  }
}

async function monitorDevice() {
  try {
    const selectDevicesQuery = 'SELECT * FROM tms_devices';

    const deviceResults = await db.query(selectDevicesQuery);

    const devices = Array.isArray(deviceResults) ? deviceResults : [deviceResults];

    devices.map(async (device) => {
      const deviceUID = device.DeviceUID;

      const selectTriggerQuery = 'SELECT * FROM tms_trigger WHERE DeviceUID = ?';
      const triggerResults = await db.query(selectTriggerQuery, deviceUID);

      const selectActualDataQuery = `SELECT * FROM actual_data WHERE DeviceUID = ? ORDER BY TimeStamp DESC LIMIT 1`;
      const actualDataResult = await db.query(selectActualDataQuery, deviceUID);
      const actualData = actualDataResult[0];

      const triggerValue = triggerResults[0].TriggerValue;
      const temperature = actualData.Temperature;
      const humidity = actualData.Humidity;
      const timestamp = new Date(actualData.Timestamp).toISOString();

      let status;
      if (triggerValue < temperature) {
        status = 'Heating';
      } else if (new Date() - new Date(timestamp) <= 5 * 60 * 1000) {
        status = 'Offline';
      } else {
        status = 'Online';
      }

      const insertLogQuery = `INSERT INTO tms_trigger_logs (DeviceUID, Temperature, Humidity, TimeStamp, Status) VALUES (?, ?, ?, ?, ?)`;
      const insertLogValues = [deviceUID, temperature, humidity, timestamp, status];

      await db.query(insertLogQuery, insertLogValues);

      console.log('Device data inserted into TMS_trigger_logs successfully!');
    });
  } catch (error) {
    console.error('Error occurred during monitoring devices:', error);
  }
}



setInterval(monitorDevice, 1000);
setInterval(testData, 1000);