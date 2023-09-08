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
    INSERT INTO device_info (deviceuid, ip_address, status, timestamp)
    VALUES (?, ?, ?, ?)
  `;

  const { deviceuid, ip_address, status, timestamp } = device;
  const statusToInsert = status || 'offline';

  db.query(insertQuery, [deviceuid, ip_address, statusToInsert, timestamp], (error, result) => {
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
