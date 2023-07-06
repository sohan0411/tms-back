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
        monitorDevice(DeviceUID, Temperature, Humidity, Timestamp);
      }
    });
  }
}

function monitorDevice() {
  const selectTriggerQuery = 'SELECT DeviceUID FROM tms_trigger';

  db.query(selectTriggerQuery, (error, triggerResults) => {
    if (error) {
      console.error('Error executing the select query: ', error);
      return;
    }

    const deviceUIDs = triggerResults.map((trigger) => trigger.DeviceUID);

    const selectActualDataQuery = `SELECT * FROM actual_data WHERE DeviceUID IN (${deviceUIDs.map(() => '?').join(',')})`;

    db.query(selectActualDataQuery, deviceUIDs, (error, actualDataResults) => {
      if (error) {
        console.error('Error executing the actual data select query: ', error);
        return;
      }

      const filteredData = actualDataResults.filter((actualData) => actualData.Temperature > 30);

      const insertLogQuery = `INSERT INTO tms_trigger_logs (DeviceUID, Temperature, Humidity, Timestamp) VALUES ?`;
      const insertLogValues = filteredData.map((data) => [
        data.DeviceUID,
        data.Temperature,
        data.Humidity,
        new Date().toISOString(),
      ]);

      if (insertLogValues.length > 0) {
        db.query(insertLogQuery, [insertLogValues], (error) => {
          if (error) {
            console.error('Error inserting the device data into TMS_trigger_logs: ', error);
            return;
          }
          console.log('Device data inserted into TMS_trigger_logs successfully!');
        });
      }

      //Device status in tms_trigger_logs
      const updateStatusQuery = `UPDATE tms_trigger_logs SET Status = CASE WHEN Timestamp >= ? THEN 'online' ELSE 'offline' END WHERE DeviceUID IN (${deviceUIDs.map(() => '?').join(',')})`;

      const lastFiveMinutes = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const updateStatusValues = [lastFiveMinutes, ...deviceUIDs];

      db.query(updateStatusQuery, updateStatusValues, (error) => {
        if (error) {
          console.error('Error updating device status in TMS_trigger_logs: ', error);
          return;
        }
        console.log('Device status updated in TMS_trigger_logs successfully!');
      });
    });
  });
}




testData();
monitorDevice();

setInterval(testData, 10000);
