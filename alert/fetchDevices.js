const db = require('./db');

async function fetchDevices() {
  const deviceQuery = `
    SELECT tms_trigger.DeviceUID, tms_trigger.ContactNO, tms_trigger.DeviceName, tms_trigger.TriggerValue, tms_trigger.interval, tms_trigger.Whatsapp, tms_trigger.PersonalEmail, tms_trigger.Mail  
    FROM tms_trigger
    JOIN tms_devices ON tms_trigger.DeviceUID = tms_devices.DeviceUID
    WHERE tms_trigger.TriggerValue IS NOT NULL AND tms_trigger.interval IS NOT NULL AND (tms_trigger.Whatsapp = 1 or tms_trigger.Mail=1) ;`;
  
  return new Promise((resolve, reject) => {
    db.query(deviceQuery, (fetchDevicesError, devices) => {
      if (fetchDevicesError) {
        reject(fetchDevicesError);
      } else {
        resolve(devices);
        // console.log(devices);
      }
    });
  });
}

module.exports = { fetchDevices };
