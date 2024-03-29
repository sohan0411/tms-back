const util = require('util');
const db = require('./db');
const cron = require('node-cron');

// Promisify db.query
const queryAsync = util.promisify(db.query).bind(db);

async function updateOrInsertData() {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const selectQuery = `
    SELECT COUNT(*) AS count FROM tms_Day_Consumption WHERE TimeStamp = ?`;

  try {
    // Start a new transaction for each update/insert operation
    await queryAsync('START TRANSACTION');
    
    const [result] = await queryAsync(selectQuery, [currentDate]);
    const count = result.count;

    if (count > 0) {
      // Data already exists, update it
      const updateQuery = `
        UPDATE tms_Day_Consumption AS dc
        SET dc.totalVolume = (
          SELECT COALESCE(ROUND(MAX(ad.totalVolume) - MIN(ad.totalVolume), 3), 0) AS totalVolume
          FROM tms.actual_data AS ad
          WHERE DATE(ad.TimeStamp) = ?
            AND ad.DeviceUID = dc.DeviceUID
            AND ad.DeviceUID IN (
              SELECT DeviceUID FROM tms.tms_devices WHERE DeviceType = 'ws' OR DeviceType = 'fs'
            )
          GROUP BY ad.DeviceUID
        )
        WHERE dc.TimeStamp = ?`;

      await queryAsync(updateQuery, [currentDate, currentDate]);
      console.log('Data Updated Successfully:', currentDate);
    } else {
      // Data doesn't exist, insert it
      const insertQuery = `
        INSERT INTO tms_Day_Consumption (DeviceUID, TimeStamp, totalVolume)
        SELECT
          ad.DeviceUID,
          ? AS TimeStamp,
          COALESCE(ROUND(MAX(ad.totalVolume) - MIN(ad.totalVolume), 3), 0) AS totalVolume
        FROM
          tms.actual_data AS ad
        WHERE
          ad.DeviceUID IN (
            SELECT DeviceUID FROM tms.tms_devices WHERE DeviceType = 'ws' OR DeviceType = 'fs'
          ) AND DATE(ad.TimeStamp) = ?
        GROUP BY
          ad.DeviceUID`;

      await queryAsync(insertQuery, [currentDate, currentDate]);
      console.log('Data Inserted Successfully:', currentDate);
    }

    // Commit the transaction
    await queryAsync('COMMIT');
  } catch (error) {
    // Rollback the transaction in case of an error
    await queryAsync('ROLLBACK');
    console.error('Error While Updating/Inserting Data:', error);
    // Assuming proper error handling is implemented here
  }
}

// Initially call the function to run it immediately
updateOrInsertData();

// Schedule cron job to run every 5 minutes
cron.schedule('*/30 * * * *', async () => {
  await updateOrInsertData();
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata'
});
