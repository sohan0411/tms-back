const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');


function sendDeviceAlertMAil(device) {
	console.log(device);
	const email = device.PersonalEmail;
  console.log(email);
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      // user: 'donotreplysenselive@gmail.com',
      // pass: 'xgcklimtlbswtzfq',
      user: 'kpohekar19@gmail.com',
      pass: 'woptjevenzhqmrpp',
    },
  });

  const templatePath = path.join(__dirname, './triggerMail.ejs');
  fs.readFile(templatePath, 'utf8', (err, templateData) => {
    if (err) {
      console.error('Error reading email template:', err);
      return;
    }

    const compiledTemplate = ejs.compile(templateData);

    const html = compiledTemplate({ device });

    const mailOptions = {
      from: 'donotreplysenselive@gmail.com',
      // to: email,
      to: 'harshavibodkhe@gmail.com',
      subject: 'Immediate Action Required: Device Trigger Threshold Exceeded',
      html: html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  });
}

 
function sendOfflineNotification(device) {
  return new Promise((resolve, reject) => {
      console.log(device);
      const email = device.PersonalEmail;
      // console.log(email);
      const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            // user: 'donotreplysenselive@gmail.com',
            // pass: 'xgcklimtlbswtzfq',
            user: 'kpohekar19@gmail.com',
            pass: 'woptjevenzhqmrpp',
          },
      });

      const templatePath = path.join(__dirname, './offlineMail.ejs');
      fs.readFile(templatePath, 'utf8', (err, templateData) => {
          if (err) {
              console.error('Error reading email template:', err);
              reject(err);
              return;
          }

          const compiledTemplate = ejs.compile(templateData);
          const html = compiledTemplate({ device });
          const mailOptions = {
              from: 'donotreplysenselive@gmail.com',
              // to: email,
              to: 'harshavibodkhe@gmail.com',
              subject: 'Device Offline Alert',
              html: html,
          };

          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  console.error('Error sending email:', error);
                  reject(error);
              } else {
                  console.log('Email sent:', info.response);
                  resolve(info);
              }
          });
      });
  });
}


module.exports = { sendDeviceAlertMAil, sendOfflineNotification };