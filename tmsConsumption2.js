const util = require('util');
const db = require('./db');
const cron = require('node-cron');

 
const queryAsync = util.promisify(db.query).bind(db);

async function fetchDevices() {
  const selectDevicesQuery = `
    SELECT DeviceUID FROM tms.tms_devices WHERE DeviceType IN ('ws', 'fs', 'ts')`;
  
  try {
    const devicesResult = await queryAsync(selectDevicesQuery);
    if (devicesResult && devicesResult.length > 0) {
      return devicesResult.map(device => device.DeviceUID);
    } else {
      console.log('No devices found.');
      return [];
    }
  } catch (error) {
    console.error('Error while fetching devices:', error);
    throw error;
  }
}


async function updateOrInsertDataForDevice(deviceUID) {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const selectQuery = `
      SELECT COUNT(*) AS count FROM tms_Day_Consumption WHERE TimeStamp = ? AND DeviceUID = ?`;
  
    try {
       
      await queryAsync('START TRANSACTION');
      
      const [result] = await queryAsync(selectQuery, [currentDate, deviceUID]);
      const count = result.count;
  
      if (count > 0) {
         
        const updateQuery = `
        UPDATE tms_Day_Consumption AS dc
        SET dc.totalVolume = COALESCE(
            (SELECT ROUND(MAX(ad.totalVolume) - MIN(ad.totalVolume), 3) AS totalVolume
            FROM tms.actual_data AS ad
            WHERE DATE(ad.TimeStamp) = ?
            AND ad.DeviceUID = dc.DeviceUID
            GROUP BY ad.DeviceUID),
            0
        )
        WHERE dc.TimeStamp = ? AND dc.DeviceUID = ?
        `;
  
        await queryAsync(updateQuery, [currentDate, currentDate, deviceUID]);
        console.log('Data Updated Successfully for Device:', deviceUID);
      } else {
         
        const insertQuery = `
        INSERT INTO tms_Day_Consumption (DeviceUID, TimeStamp, totalVolume)
        SELECT
          devices.DeviceUID,
          ? AS TimeStamp,
          COALESCE(ROUND(MAX(COALESCE(ad.totalVolume, 0)) - MIN(COALESCE(ad.totalVolume, 0)), 3), 0) AS totalVolume
        FROM
          tms.tms_devices AS devices
        LEFT JOIN
          tms.actual_data AS ad ON devices.DeviceUID = ad.DeviceUID AND DATE(ad.TimeStamp) = ?
        WHERE
          devices.DeviceUID = ?
        GROUP BY
          devices.DeviceUID`;
    

        await queryAsync(insertQuery, [ currentDate, currentDate, deviceUID,]);
        console.log('Data Inserted Successfully for Device:', deviceUID);
      }
  
      
      await queryAsync('COMMIT');
    } catch (error) {
      
      await queryAsync('ROLLBACK');
      console.error('Error While Updating/Inserting Data for Device:', deviceUID, error);
       
    }
  }
  

async function updateOrInsertDataForAllDevices() {
  try {
    const devices = await fetchDevices();
    for (const deviceUID of devices) {
      await updateOrInsertDataForDevice(deviceUID);
    }
  } catch (error) {
    console.error('Error while updating/inserting data for all devices:', error);
  }
}

 
updateOrInsertDataForAllDevices();

 
cron.schedule('*/5 * * * *', async () => {
  await updateOrInsertDataForAllDevices();
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata'
});

