require('dotenv').config();
// const accountSid = process.env.accountSid;
// const authToken = process.env.authToken;

// const client = require('twilio')(accountSid, authToken);


function sendWhatsappOfflineAlert(device){
    contact = device.ContactNO;
    client.messages
          .create({
              body: `ALERT!\n🔔Warning: We're reaching out to inform you that device ${device.DeviceName}(UID: ${device.DeviceUID}) hasn't recorded any recent entries, indicating it may be offline or disconnected. It's essential to investigate promptly to prevent any potential risks or interruptions to its functionality.\nThank you for your attention to this matter.`,
              from: `whatsapp:+14155238886`,
              to: 'whatsapp:+918208243462'
            //   to: `whatsapp:${ContactNO}`
          })
          .then(message => console.log(message.sid));
}


function sendWhatsappTriggerAlert(device){
    contact = device.ContactNO;
    client.messages
          .create({
              body: `DEVICE ALERT!\n🔔Warning: We're reaching out to alert you that device ${device.DeviceName}(UID: ${device.DeviceUID}) has surpassed its Trigger value. It's crucial to promptly inspect the device for any unwarranted alerts. Immediate action can mitigate potential risks or interruptions to its functionality.\nThank you for your attention to this matter.`,
              from: 'whatsapp:+14155238886',
              to: 'whatsapp:+918208243462'
            //   to: `whatsapp:${ContactNO}`
          })
          .then(message => console.log(message.sid));
        

}


module.exports ={
    sendWhatsappOfflineAlert, 
    sendWhatsappTriggerAlert
}