const db = require('./db');

const maxEntriesToKeep = 10; // Change this value to the maximum number of entries you want to keep

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
    INSERT INTO device_info (deviceuid, ip_address, status, timestamp,company_name,company_location)
    VALUES (?, ?, ?, ?,?,?)
  `;

  const { deviceuid, ip_address, status, timestamp } = device;
  const statusToInsert = status || 'offline';
  const company_name="Senselive";
  const company_location="Nagpur";

  db.query(insertQuery, [deviceuid, ip_address, statusToInsert, timestamp,company_name,company_location], (error, result) => {
    if (error) {
      console.error('Error inserting device data:', error);
    } else {
      // Insertion successful, now delete old data if necessary
      deleteOldDeviceInfo(maxEntriesToKeep);
    }
  });
}

function deleteOldDeviceInfo(maxEntries) {
  const selectIdsQuery = `
    SELECT id
    FROM device_info
    ORDER BY timestamp DESC
    LIMIT ?
  `;

  db.query(selectIdsQuery, [maxEntries], (error, results) => {
    if (error) {
      console.error('Error selecting IDs to keep:', error);
    } else {
      const idsToKeep = results.map((result) => result.id);

      if (idsToKeep.length > 0) {
        const deleteQuery = `
          DELETE FROM device_info
          WHERE id NOT IN (${idsToKeep.join(',')})
        `;

        db.query(deleteQuery, (deleteError, deleteResult) => {
          if (deleteError) {
            console.error('Error deleting old device data:', deleteError);
          } else {
            //console.log('Deleted old device data from device_info table');
          }
        });
      }
    }
  });
}

const limit = 9;

function runCode() {
  DeviceIP(limit, (error, devices) => {
    if (error) {
      console.error('Error:', error);
    } else {
      devices.forEach((device) => {
        DeviceInfo(device);
      });
    }
    setTimeout(runCode, 5000);
  });
}

runCode();

function deleteDevicedata(req, res) {
  try {
    const deviceUID = req.params.deviceUID;
    const deleteDeviceQuery = 'DELETE FROM device_info WHERE deviceuid = ?';

    db.query(deleteDeviceQuery, [deviceUID], (error, result) => {
      if (error) {
        console.error('Error deleting device:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Device not found' });
      }

      res.json({ message: 'Device deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
// const db = require('./db');
// const NodeCache = require('node-cache');

// const maxEntriesToKeep = 10; // Change this value to the maximum number of entries you want to keep

// // Create an in-memory cache instance
// const dataCache = new NodeCache({ stdTTL: 60 }); // Cache data for 60 seconds

// function DeviceIP(limit, callback) {
//   // Check if data is in cache
//   const cachedData = dataCache.get('deviceData');
//   if (cachedData) {
//     console.log('Data found in cache');
//     callback(null, cachedData);
//   } else {
//     const selectQuery = `
//       SELECT
//         deviceuid,
//         ip_address,
//         status,
//         timestamp
//       FROM
//         actual_data
//       ORDER BY
//         timestamp DESC
//       LIMIT ?
//     `;

//     db.query(selectQuery, [limit], (error, results) => {
//       if (error) {
//         console.error('Error fetching device data:', error);
//         callback(error, null);
//       } else {
//         const devices = results;
//         // Store the fetched data in cache
//         dataCache.set('deviceData', devices);
//         callback(null, devices);
//       }
//     });
//   }
// }

// function DeviceInfo(device) {
//   const insertQuery = `
//     INSERT INTO device_info (deviceuid, ip_address, status, timestamp)
//     VALUES (?, ?, ?, ?)
//   `;

//   const { deviceuid, ip_address, status, timestamp } = device;
//   const statusToInsert = status || 'offline';

//   db.query(insertQuery, [deviceuid, ip_address, statusToInsert, timestamp], (error, result) => {
//     if (error) {
//       console.error('Error inserting device data:', error);
//     } else {
//       // Insertion successful, now delete old data if necessary
//       deleteOldDeviceInfo(maxEntriesToKeep);
//     }
//   });
// }

// function deleteOldDeviceInfo(maxEntries) {
//   const selectIdsQuery = `
//     SELECT id
//     FROM device_info
//     ORDER BY timestamp DESC
//     LIMIT ?
//   `;

//   db.query(selectIdsQuery, [maxEntries], (error, results) => {
//     if (error) {
//       console.error('Error selecting IDs to keep:', error);
//     } else {
//       const idsToKeep = results.map((result) => result.id);

//       if (idsToKeep.length > 0) {
//         const deleteQuery = `
//           DELETE FROM device_info
//           WHERE id NOT IN (${idsToKeep.join(',')})
//         `;

//         db.query(deleteQuery, (deleteError, deleteResult) => {
//           if (deleteError) {
//             console.error('Error deleting old device data:', deleteError);
//           } else {
//             //console.log('Deleted old device data from device_info table');
//           }
//         });
//       }
//     }
//   });
// }

// const limit = 9;

// function runCode() {
//   DeviceIP(limit, (error, devices) => {
//     if (error) {
//       console.error('Error:', error);
//     } else {
//       devices.forEach((device) => {
//         DeviceInfo(device);
//       });
//     }
//     setTimeout(runCode, 5000);
//   });
// }

// runCode();

module.exports = { deleteDevicedata};