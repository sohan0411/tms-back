const { fetchDevices } = require('./fetchDevices');
const { fetchLatestEntries } = require('./fetchData');
const { fetchLastSend, insertMsgSend } = require('./fetchMsgSend');
const {  sendOfflineNotification } = require('./sendMail');
const { sendWhatsappOfflineAlert } = require('./sendWhatsapp');
  

async function processBatchOfDevices(devices) {
    const latestEntries = await fetchLatestEntries(devices);
    const lastMsgSend = await fetchLastSend(devices);
    const currentTime = new Date();
    const oneDayAgo = new Date(currentTime.getTime() - (1 * 24 * 60 * 60 * 1000));
    const fourWeeksAgo = new Date(currentTime.getTime() - (28 * 24 * 60 * 60 * 1000));
  
    await Promise.all(devices.map(async device => {
      const deviceEntries = latestEntries[device.DeviceUID]?.entry || [];
      const hasLatestEntryWithinLastDay = deviceEntries.some(entry => {
        const entryTimestamp = new Date(entry.TimeStamp.getTime() + (330 * 60 * 1000));
        return entryTimestamp > oneDayAgo;
      });
      const hasNoDataWithinLastFourWeeks = deviceEntries.every(entry => {
        const entryTimestamp = new Date(entry.TimeStamp.getTime() + (330 * 60 * 1000));
        return entryTimestamp < fourWeeksAgo;
      });
      if (!hasNoDataWithinLastFourWeeks && !hasLatestEntryWithinLastDay) {
        const deviceLastMsgs = lastMsgSend[device.DeviceUID]?.entry || [];
        const lastMSGSendTime = deviceLastMsgs.length > 0 ? new Date(deviceLastMsgs[0].lastSend) : null;
        if (!lastMSGSendTime || (currentTime - lastMSGSendTime >= device.interval * 60 * 1000)) {
          
            if (device.Mail == 1){
                await sendOfflineNotification(device);
                console.log("Offline Mail sent for ",device.DeviceUID)
            }
            if (device.Whatsapp == 1){
                // console.log("Whatsapp msg sent for",device.DeviceUID)
                // sendWhatsappOfflineAlert(device);
            }
            await insertMsgSend(device.DeviceUID, 'Device Offline');
        }
      }
    }));
  }
  
  async function fetchAndProcessDevices() {
    try {
      const devicesArray = await fetchDevices();
      const batchSize = 5; 
      for (let i = 0; i < devicesArray.length; i += batchSize) {
        const batch = devicesArray.slice(i, i + batchSize);
        await processBatchOfDevices(batch);
      }
    } catch (error) {
      console.error('Error fetching and processing devices:', error);
    }
  }
  
  async function startProcessing() {
    await fetchAndProcessDevices();
    setInterval(fetchAndProcessDevices, 5000);
  }
  
  startProcessing();
  