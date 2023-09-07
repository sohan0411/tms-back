const db = require('./db');

function DeviceIP(limit, callback) {
  const selectQuery = `
    SELECT
      deviceuid,
      ip_address,
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

const limit = 9;

function runCode() {
  DeviceIP(limit, (error, devices) => {
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Latest Device Data:');
      devices.forEach((device) => {
        console.log(
          `Device ID: ${device.deviceuid}, IP Address: ${device.ip_address}, Timestamp: ${device.timestamp}`
        );
      });
    }
    setTimeout(runCode, 5000);
  });
}

runCode();

// const db = require('./db');

// function fetchLatestDeviceData(limit, callback) {
//   const selectQuery = `
//     SELECT
//       a.deviceuid,
//       a.ip_address,
//       a.timestamp,
//       t.Status
//     FROM
//       actual_data a
//     LEFT JOIN
//       tms_trigger_logs t ON a.deviceuid = t.deviceuid
//     ORDER BY
//       a.timestamp DESC
//     LIMIT ?
//   `;

//   console.log('Executing SQL Query:', selectQuery); // Add this line to log the query execution

//   db.query(selectQuery, [limit], (error, results) => {
//     if (error) {
//       console.error('Error fetching latest device data:', error);
//       callback(error, null);
//     } else {
//       const devices = results;
//       callback(null, devices);
//     }
//   });
// }

// const limit = 9;

// function runCode() {
//   fetchLatestDeviceData(limit, (error, devices) => {
//     if (error) {
//       console.error('Error:', error);
//     } else {
//       console.log('Latest Device Data:');
//       devices.forEach((device) => {
//         console.log(
//           `Device ID: ${device.deviceuid}, IP Address: ${device.ip_address}, Timestamp: ${device.timestamp}, Status: ${device.status}`
//         );
//       });
//     }
//     setTimeout(runCode, 5000);
//   });
// }

// runCode();
