const db = require('./db');

function monitorDevice() {
  const selectTriggerQuery = 'SELECT tms_devices.DeviceUID, tms_trigger.TriggerValue FROM tms_trigger JOIN tms_devices ON tms_trigger.DeviceUID = tms_devices.DeviceUID';

  db.query(selectTriggerQuery, (error, triggerResults) => {
    if (error) {
      console.error('Error executing the select query: ', error);
      return;
    }

    const deviceData = triggerResults.map((trigger) => ({
      DeviceUID: trigger.DeviceUID,
      TriggerValue: trigger.TriggerValue,
    }));

    const deviceUIDs = deviceData.map((device) => device.DeviceUID);

    const selectLatestDataQuery = `
      SELECT *
      FROM actual_data
      WHERE (DeviceUID, TimeStamp) IN (
        SELECT DeviceUID, MAX(TimeStamp) AS MaxTimeStamp
        FROM actual_data
        WHERE DeviceUID IN (${deviceUIDs.map(() => '?').join(', ')})
        GROUP BY DeviceUID
      )`;

    db.query(selectLatestDataQuery, deviceUIDs, (error, latestDataResults) => {
      if (error) {
        console.error('Error executing the latest data select query: ', error);
        return;
      }

      const insertLogQuery = 'INSERT INTO tms_trigger_logs (DeviceUID, Temperature, Humidity, TimeStamp, Status) VALUES ?';
      const insertLogValues = [];
      const currentTimestamp = new Date().toISOString();

      deviceData.forEach((device) => {
        const latestData = latestDataResults.find((data) => data.DeviceUID === device.DeviceUID);

        if (latestData) {
          const { DeviceUID, Temperature, Humidity, TimeStamp } = latestData;
          const latestDateTime = new Date(TimeStamp);
          
          const timeDifference = new Date() - latestDateTime;
          
          const isDeviceOnline = timeDifference <= 5 * 60 * 1000;
          let status = ''; // Define the status variable within the loop

          if (isDeviceOnline) {
            if (Temperature > device.TriggerValue) {
              insertLogValues.push([DeviceUID, Temperature, Humidity, currentTimestamp, 'heating']);
              status = 'heating';
            } else {
              insertLogValues.push([DeviceUID, Temperature, Humidity, currentTimestamp, 'online']);
              status = 'online';
            }
          } else {
            insertLogValues.push([DeviceUID, Temperature, Humidity, currentTimestamp, 'offline']);
            status = 'offline';
          }

          // Update status in 'actual_data' table
          const updateStatusQuery = 'UPDATE actual_data SET status = ? WHERE DeviceUID = ?';
          db.query(updateStatusQuery, [status, DeviceUID], (error) => {
            if (error) {
              console.error('Error updating status in actual_data table: ', error);
            }
          });

          // Update status in 'tms_devices' table
          const updateStatusQueryTMS = 'UPDATE tms_devices SET Status = ? WHERE DeviceUID = ?';
          db.query(updateStatusQueryTMS, [status, DeviceUID], (error) => {
            if (error) {
              console.error('Error updating status in tms_devices table: ', error);
            }
          });
        }
      });

      if (insertLogValues.length > 0) {
        db.query(insertLogQuery, [insertLogValues], (error) => {
          if (error) {
            console.error('Error inserting the device data into tms_log: ', error);
            return;
          }
        });
      }
    });
  });
}

setInterval(monitorDevice, 20000);
