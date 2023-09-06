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
      SELECT ad.DeviceUID, ad.Temperature, ad.Humidity, ad.TimeStamp, ad.ip_address, MAX(ad.TimeStamp) AS MaxTimeStamp
      FROM actual_data ad
      WHERE ad.DeviceUID IN (${deviceUIDs.map(() => '?').join(', ')})
      GROUP BY ad.DeviceUID
    `;

    db.query(selectLatestDataQuery, deviceUIDs, (error, latestDataResults) => {
      if (error) {
        console.error('Error executing the latest data select query: ', error);
        return;
      }

      const insertLogQuery = 'INSERT INTO tms_trigger_logs (DeviceUID, Temperature, Humidity, TimeStamp, Status, ip_address) VALUES ?';
      const insertLogValues = [];
      const currentTimestamp = new Date().toISOString();

      deviceData.forEach((device) => {
        const latestData = latestDataResults.find((data) => data.DeviceUID === device.DeviceUID);

        if (latestData) {
          const { DeviceUID, Temperature, Humidity, TimeStamp, ip_address } = latestData;
          const latestDateTime = new Date(TimeStamp);

          const timeDifference = new Date() - latestDateTime;

          const isDeviceOnline = timeDifference <= 5 * 60 * 1000;

          if (isDeviceOnline) {
            if (Temperature > device.TriggerValue) {
              insertLogValues.push([DeviceUID, Temperature, Humidity, currentTimestamp, 'heating', ip_address]);
            } else {
              insertLogValues.push([DeviceUID, Temperature, Humidity, currentTimestamp, 'online', ip_address]);
            }
          } else {
            insertLogValues.push([DeviceUID, Temperature, Humidity, currentTimestamp, 'offline', ip_address]);
          }
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
