const { fetchDevices } = require('./fetchDevices');
const { fetchLatestEntries } = require('./fetchData');
const { fetchLastSend, insertMsgSend } = require('./fetchMsgSend');
const { sendDeviceAlertMAil} = require('./sendMail');
const { sendWhatsappTriggerAlert } = require('./sendWhatsapp')

// old
// async function fetchDataForDevices() {
//   try {
//     const devicesArray = await fetchDevices();
//     const latestEntries = await fetchLatestEntries(devicesArray);
//     const lastMsgSend = await fetchLastSend(devicesArray);
  
//     devicesArray.forEach(device => {
//         const triggerValue = parseFloat(device.TriggerValue);
//         const deviceEntries = latestEntries[device.DeviceUID].entry;
//         const currentTime = new Date();
//         deviceEntries.forEach(entry => {
//             const entryTimestamp = new Date(entry.TimeStamp.getTime() + (330 * 60 * 1000));
//             const timeDifference = currentTime - entryTimestamp;
//             const minutesDifference = Math.floor(timeDifference / (1000 * 60));
//             if (
//                 (parseFloat(entry.Temperature) > triggerValue ||
//                 parseFloat(entry.TemperatureR) > triggerValue ||
//                 parseFloat(entry.TemperatureY) > triggerValue ||
//                 parseFloat(entry.TemperatureB) > triggerValue ||
//                 parseFloat(entry.flowRate) > triggerValue ||
//                 parseFloat(entry.Pressure) > triggerValue) &&
//                 minutesDifference <= 10
//             ) {
//                 const deviceLastMsgs = lastMsgSend[device.DeviceUID].entry;
//                 deviceLastMsgs.forEach(msgSend => {
//                     const lastMSGSendTime = new Date(msgSend.lastSend);
//                     const timeDifference = currentTime - lastMSGSendTime;
//                     const minutesDifference = Math.floor(timeDifference / (1000 * 60)); 


//                     if (minutesDifference >= device.interval) {
//                       if (device.Mail == 1){
//                         // sendDeviceAlertMAil(device);
//                         console.log("Mail",device.DeviceUID)
//                       }

//                       if (device.Whatsapp == 1){
//                         // sendWhatsappAlert(device);
//                       }
//                       // insertMsgSend(device.DeviceUID);
//                     }
//                 });
//             }
//         });
//     });
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// }

// func with offline notification combined
// async function fetchDataForDevices() {
//   try {
//     const devicesArray = await fetchDevices();
//     const latestEntries = await fetchLatestEntries(devicesArray);
//     const lastMsgSend = await fetchLastSend(devicesArray);
  
//     const currentTime = new Date();
//     const oneDayAgo = new Date(currentTime.getTime() - (1 * 24 * 60 * 60 * 1000)); 
//     const fourWeeksAgo = new Date(currentTime.getTime() - (28 * 24 * 60 * 60 * 1000));

//     devicesArray.forEach(device => {
//       const triggerValue = parseFloat(device.TriggerValue);
//       const deviceEntries = latestEntries[device.DeviceUID]?.entry || []; 
      
      
//       const hasLatestEntryWithinLastDay = deviceEntries.some(entry => {
//         const entryTimestamp = new Date(entry.TimeStamp.getTime() + (330 * 60 * 1000));
//         return entryTimestamp > oneDayAgo;
//       });

     
//       const hasNoDataWithinLastFourWeeks = deviceEntries.every(entry => {
//         const entryTimestamp = new Date(entry.TimeStamp.getTime() + (330 * 60 * 1000));
//         return entryTimestamp < fourWeeksAgo;
//       });

//       if (!hasNoDataWithinLastFourWeeks && !hasLatestEntryWithinLastDay) {
        
//         const deviceLastMsgs = lastMsgSend[device.DeviceUID]?.entry || []; 
//         const lastMSGSendTime = deviceLastMsgs.length > 0 ? new Date(deviceLastMsgs[0].lastSend) : null;
//         if (!lastMSGSendTime || (currentTime - lastMSGSendTime >= device.interval * 60 * 1000)) {
//           if (device.Mail == 1) {
//             sendOfflineNotification(device);
//             console.log("Mail sent for offline device:", device.DeviceUID);
//           }
//           insertMsgSend(device.DeviceUID,'Device Offline');
//         }
//         return; 
//       }

//       deviceEntries.forEach(entry => {
//         const entryTimestamp = new Date(entry.TimeStamp.getTime() + (330 * 60 * 1000));
//         const timeDifference = currentTime - entryTimestamp;
//         const minutesDifference = Math.floor(timeDifference / (1000 * 60));

//         if (
//           (parseFloat(entry.Temperature) > triggerValue ||
//           parseFloat(entry.TemperatureR) > triggerValue ||
//           parseFloat(entry.TemperatureY) > triggerValue ||
//           parseFloat(entry.TemperatureB) > triggerValue ||
//           parseFloat(entry.flowRate) > triggerValue ||
//           parseFloat(entry.Pressure) > triggerValue) &&
//           minutesDifference <= 10
//         ) {
//           const deviceLastMsgs = lastMsgSend[device.DeviceUID]?.entry || []; 
//           deviceLastMsgs.forEach(msgSend => {
//             const lastMSGSendTime = new Date(msgSend.lastSend);
//             const timeDifference = currentTime - lastMSGSendTime;
//             const minutesDifference = Math.floor(timeDifference / (1000 * 60)); 

//             if (minutesDifference >= device.interval) {
//               if (device.Mail == 1) {
//                 sendDeviceAlertMAil(device);
//                 console.log("Alert Mail sent:", device.DeviceUID);
//               }
//               if (device.Whatsapp == 1) {
//                 // sendWhatsappAlert(device);
//               }
//               insertMsgSend(device.DeviceUID,'Trigger Alert');
//             }
//           });
//         }
//       });
//     });
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// }   


// FUNC FOR ONLY TRIGGERS ALERT

async function fetchDataForDevices() {
  try {
    const devicesArray = await fetchDevices();
    const latestEntries = await fetchLatestEntries(devicesArray);
    const lastMsgSend = await fetchLastSend(devicesArray);
  
    devicesArray.forEach(device => {
        const triggerValue = parseFloat(device.TriggerValue);
        const deviceEntries = latestEntries[device.DeviceUID].entry;
        const currentTime = new Date();
        deviceEntries.forEach(entry => {
            const entryTimestamp = new Date(entry.TimeStamp.getTime() + (330 * 60 * 1000));
            const timeDifference = currentTime - entryTimestamp;
            const minutesDifference = Math.floor(timeDifference / (1000 * 60));
            if (
                (parseFloat(entry.Temperature) > triggerValue ||
                parseFloat(entry.TemperatureR) > triggerValue ||
                parseFloat(entry.TemperatureY) > triggerValue ||
                parseFloat(entry.TemperatureB) > triggerValue ||
                parseFloat(entry.flowRate) > triggerValue ||
                parseFloat(entry.Pressure) > triggerValue) &&
                minutesDifference <= 10
            ) {
                const deviceLastMsgs = lastMsgSend[device.DeviceUID].entry;
                deviceLastMsgs.forEach(msgSend => {
                    const lastMSGSendTime = new Date(msgSend.lastSend);
                    const timeDifference = currentTime - lastMSGSendTime;
                    const minutesDifference = Math.floor(timeDifference / (1000 * 60)); 


                    if (minutesDifference >= device.interval) {
                      if (device.Mail == 1){
                        sendDeviceAlertMAil(device);
                        console.log("Mail",device.DeviceUID)
                      }

                      if (device.Whatsapp == 1){
                        // sendWhatsappTriggerAlert(device);
                        // console.log("Whatsapp msg sent for",device.DeviceUID)
                      }
                      insertMsgSend(device.DeviceUID,'Trigger Alert');
                    }
                });
            }
        });
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}



fetchDataForDevices();

setInterval(fetchDataForDevices, 5000);
