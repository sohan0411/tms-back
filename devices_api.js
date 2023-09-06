

// const db = require('./db');

// function DeviceIP(limit, callback) {
//   const selectQuery = `
//     SELECT DISTINCT ON (DeviceUID)
//       DeviceUID, ip_address
//     FROM
//     tms_trigger_logs
//     ORDER BY
//     DeviceUID, "TimeStamp" DESC
//     LIMIT ?
//   `;

//   db.query(selectQuery, [limit], (error, result) => {
//     if (error) {
//       console.error('Error fetching device IDs and IP addresses:', error);
//       callback(error, null);
//     } else {
//       const devices = result.rows;
//       callback(null, devices);
//     }
//   });
// }

// const limit = 9;
// DeviceIP(limit, (error, devices) => {
//   if (error) {
//     console.error('Error:', error);
//   } else {
//     console.log('Device IDs and IP Addresses:');
//     devices.forEach(device => {
//       console.log(`Device ID: ${device.deviceuid}, IP Address: ${device.ip_address}`);
//     });
//   }
// });

const db = require('./db');

function DeviceIP(limit, callback) {
  const selectQuery = `
    SELECT DISTINCT ON (DeviceUID)
      DeviceUID, ip_address
    FROM
      tms_trigger_logs
    ORDER BY
      DeviceUID, "TimeStamp" DESC
    LIMIT ?
  `;

  console.log('SQL Query:', selectQuery); // Debugging statement

  db.query(selectQuery, [limit], (error, result) => {
    if (error) {
      console.error('Error fetching device IDs and IP addresses:', error);
      callback(error, null);
    } else {
      const devices = result.rows;
      callback(null, devices);
    }
  });
}

const limit = 9;
DeviceIP(limit, (error, devices) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Device IDs and IP Addresses:');
    devices.forEach(device => {
      console.log(`Device ID: ${device.deviceuid}, IP Address: ${device.ip_address}`);
    });
  }
});
