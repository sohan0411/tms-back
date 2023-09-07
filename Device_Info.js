const db = require('./db');

function DeviceIP(limit, callback) {
  const selectQuery = `
    SELECT
      deviceuid,
      ip_address,
      status,
      timestamp
    FROM
      actual_data
    ORDER BY
      timestamp DESC
    LIMIT ?
  `;

  db.query(selectQuery, [limit], (error, results) => {
    if (error) {
      console.error('Error fetching device data:', error);
      callback(error, null);
    } else {
      const devices = results;
      callback(null, devices);
    }
  });
}

function DeviceInfo(device) {
  const insertQuery = `
    INSERT INTO device_info (deviceuid, ip_address, status, timestamp)
    VALUES (?, ?, ?, ?)
  `;

  const { deviceuid, ip_address, status, timestamp } = device;
  const statusToInsert = status || 'offline';

  db.query(insertQuery, [deviceuid, ip_address, statusToInsert, timestamp], (error, result) => {
    if (error) {
      console.error('Error inserting device data:', error);
    } else {
      console.log('Inserted device data into device_info table');
    }
  });
}

const limit = 9;

function runCode() {
  DeviceIP(limit, (error, devices) => {
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Latest Device Data:');
      devices.forEach((device) => {
        console.log(
          `Device ID: ${device.deviceuid}, IP Address: ${device.ip_address}, Status: ${device.status}, Timestamp: ${device.timestamp}`
        );

        // Insert device data into the device_info table
        DeviceInfo(device);
      });
    }
    setTimeout(runCode, 5000);
  });
}

runCode();
