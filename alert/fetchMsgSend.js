const db = require('./db');

async function fetchLastSend(devices) {
  const fetchLatestEntryQuery = `
    SELECT * FROM tms_alert_interval WHERE DeviceUID = ? ORDER BY lastSend DESC LIMIT 1
  `;

  const defaultEntry = {
    id: 0,
    DeviceUID: null,
    lastSend: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  try {
    const promises = devices.map(async ({ DeviceUID }) => {
      try {
        const fetchLatestEntryResult = await new Promise((resolve, reject) => {
          db.query(fetchLatestEntryQuery, [DeviceUID], (fetchLatestEntryError, result) => {
            if (fetchLatestEntryError) {
              reject(fetchLatestEntryError);
            } else {
              resolve(result);
            }
          });
        });

        const deviceEntry = fetchLatestEntryResult.length === 0 ? [defaultEntry] : fetchLatestEntryResult;
        return { [DeviceUID]: { entry: deviceEntry } };
      } catch (error) {
        console.error("Error fetching latest entry for DeviceUID:", DeviceUID, error);
        return { [DeviceUID]: { entry: [defaultEntry] } };
      }
    });


    const latestEntries = await Promise.all(promises);
    return latestEntries.reduce((acc, curr) => Object.assign(acc, curr), {});
  } catch (error) {
    // Handle any errors occurred during the process
    console.error("Error in fetchLatestEntries:", error);
    throw error; // Rethrow the error for the caller to handle
  }
}

async function insertMsgSend(DeviceUID,message) {
  // Get current Indian Standard Time (IST)
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is 5.5 hours ahead of UTC
  const nowIST = new Date(Date.now() + istOffset);

  // Format the date to be used in MySQL query
  const formattedDate = nowIST.toISOString().slice(0, 19).replace('T', ' ');

  const insertQuery = `
    INSERT INTO tms_alert_interval (DeviceUID, lastSend, message) VALUES (?, ?, ?)
  `;

  try {
    await new Promise((resolve, reject) => {
      db.query(insertQuery, [DeviceUID, formattedDate,message], (insertError, result) => {
        if (insertError) {
          reject(insertError);
        } else {
          resolve(result);
        }
      });
    });
    console.log("Data inserted successfully for DeviceUID:", DeviceUID);
  } catch (error) {
    console.error("Error inserting data for DeviceUID:", DeviceUID, error);
    throw error;
  }
}


module.exports = { fetchLastSend, insertMsgSend };
