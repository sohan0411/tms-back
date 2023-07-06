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

function monitorDevice() {
  const selectTriggerQuery = 'SELECT tms_devices.DeviceUID, tms_trigger.TriggerValue FROM tms_trigger JOIN tms_devices ON tms_trigger.DeviceUID = tms_devices.DeviceUID';

  db.query(selectTriggerQuery, (error, triggerResults) => {
    if (error) {
      console.error('Error executing the select query: ', error);
      return;
    }

    const deviceData = triggerResults.map((trigger) => ({
      DeviceUID: trigger.DeviceUID,
      TriggerValue: trigger.TriggerValue
    }));

    const deviceUIDs = deviceData.map((device) => device.DeviceUID);

    const selectLatestDataQuery = `
      SELECT *
      FROM actual_data
      WHERE (DeviceUID, Timestamp) IN (
        SELECT DeviceUID, MAX(Timestamp) AS MaxTimestamp
        FROM actual_data
        WHERE DeviceUID IN (${deviceUIDs.map(() => '?').join(', ')})
        GROUP BY DeviceUID
      )`;

    db.query(selectLatestDataQuery, deviceUIDs, (error, latestDataResults) => {
      if (error) {
        console.error('Error executing the latest data select query: ', error);
        return;
      }

      const insertLogQuery = `INSERT INTO tms_trigger_logs (DeviceUID, Temperature, Humidity, TimeStamp, Status) VALUES ?`;
      const insertLogValues = [];

      deviceData.forEach((device) => {
        const latestData = latestDataResults.find((data) => data.DeviceUID === device.DeviceUID);

        if (latestData) {
          const { DeviceUID, Temperature, Humidity, TimeStamp } = latestData;
          const status = new Date(TimeStamp) >= new Date(Date.now() - 5 * 60 * 1000) ? 'online' : 'offline';
          const triggerValue = device.TriggerValue;

          if (Temperature > triggerValue) {
            insertLogValues.push([DeviceUID, Temperature, Humidity, TimeStamp, 'heating']);
          } else {
            insertLogValues.push([DeviceUID, Temperature, Humidity, TimeStamp, status]);
          }
        }
      });

      if (insertLogValues.length > 0) {
        db.query(insertLogQuery, [insertLogValues], (error) => {
          if (error) {
            console.error('Error inserting the device data into tms_log: ', error);
            return;
          }
          console.log('Device data inserted into tms_log successfully!');
        });
      }
    });
  });
}



setInterval(testData, 1000);
setInterval(monitorDevice, 1000);