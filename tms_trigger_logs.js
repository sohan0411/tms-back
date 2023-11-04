const util = require('util');
const db = require('./db');
const query = util.promisify(db.query);

async function monitorDevice() {
  try {
    const selectTriggerQuery = 'SELECT tms_devices.DeviceUID, tms_trigger.TriggerValue FROM tms_trigger JOIN tms_devices ON tms_trigger.DeviceUID = tms_devices.DeviceUID';
    const triggerResults = await query(selectTriggerQuery);

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

    const latestDataResults = await query(selectLatestDataQuery, deviceUIDs);

    const insertLogQuery = 'INSERT INTO tms_trigger_logs (DeviceUID, Temperature, Humidity, TimeStamp, Status) VALUES ?';
    const insertLogValues = [];
    const currentTimestamp = new Date().toISOString();

    const processDevices = async (deviceData) => {
      for (const device of deviceData) {
        const latestData = latestDataResults.find((data) => data.DeviceUID === device.DeviceUID);

        if (latestData) {
          const { DeviceUID, Temperature, Humidity, TimeStamp } = latestData;
          const latestDateTime = new Date(TimeStamp);

          const timeDifference = new Date() - latestDateTime;

          const isDeviceOnline = timeDifference <= 5 * 60 * 1000;
          let status = '';

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

          await updateStatus(status, DeviceUID);
        }
      }
    };

    await processDevices(deviceData);

    if (insertLogValues.length > 0) {
      await query(insertLogQuery, [insertLogValues]);
    }
  } catch (error) {
    console.error('Error in monitorDevice: ', error);
  }
}

async function updateStatus(status, DeviceUID) {
  try {
    const updateStatusQuery = 'UPDATE actual_data SET status = ? WHERE DeviceUID = ?';
    await query(updateStatusQuery, [status, DeviceUID]);
  } catch (error) {
    console.error('Error updating status in actual_data table: ', error);
  }

  try {
    const updateStatusQueryTMS = 'UPDATE tms_devices SET Status = ? WHERE DeviceUID = ?';
    await query(updateStatusQueryTMS, [status, DeviceUID]);
  } catch (error) {
    console.error('Error updating status in tms_devices table: ', error);
  }
}

async function monitorAndInsertData() {
  try {
    await monitorDevice();
  } catch (error) {
    console.error('Error in monitorAndInsertData: ', error);
  }
}

setInterval(monitorAndInsertData, 20000);
