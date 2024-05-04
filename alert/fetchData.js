const db = require('./db');

async function fetchLatestEntries(devices) {
  const fetchLatestEntryQuery = `
    SELECT * FROM actual_data WHERE DeviceUID = ? ORDER BY EntryID DESC LIMIT 1
  `;

  const defaultEntry = {
    EntryID: 0,
    DeviceUID: null,
    Temperature: null,
    TemperatureR: null,
    TemperatureY: null,
    TemperatureB: null,
    Humidity: null,
    flowRate: null,
    totalVolume: null,
    TimeStamp: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    ip_address: "0.0.0.0",
    status: null
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
              // console.log(result);
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

module.exports = { fetchLatestEntries };
