const twilio = require('twilio');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const accountSid = 'ACb8754fe2a8a8139f772c8681da354639';
const authToken = 'b2268e25a2b064f585859abab3b0b4b3';
const twilioPhoneNumber = 'whatsapp:+918788209649';
const twilioClient = twilio(accountSid, authToken);

const dbConfig = {
  host: 'senselivedb.cn5vfllmzwrp.ap-south-1.rds.amazonaws.com',
  user: 'admin',
  password: 'sense!123',
  database: 'tmp',
};

const previousDeviceStates = {};

function checkState() {
  const connection = mysql.createConnection(dbConfig);

  connection.query('SELECT id, device_name, phone_number, email, is_online, is_heating FROM devices', (err, queryResults) => {
    if (err) {
      console.error('Error fetching data from the database:', err);
      connection.end();
      return;
    }

    const devices = queryResults;

    devices.forEach((device) => {
      const deviceId = device.id;
      const previousState = previousDeviceStates[deviceId] || false;
      const currentState = {
        isOnline: device.is_online === 1,
        isHeating: device.is_heating === 1,
      };

      if (previousState.isOnline !== currentState.isOnline || previousState.isHeating !== currentState.isHeating) {
        previousDeviceStates[deviceId] = currentState;

        let message;
        if (currentState.isOnline) {
          message = `${device.device_name} is online.`;
        } else {
          message = `${device.device_name} is offline.`;
        }

        if (currentState.isHeating) {
          message += " Device is heating.";
        } else {
          message += " Device is not heating.";
        }

        sendSMS(device.phone_number, message);
        sendEmail(device.email, renderEmailTemplate(devices)); // Use the rendered email template

        // Log information to the database
        logInfoToDatabase('SMS', 'Device Status Update', message, device.phone_number, null, 0);
        logInfoToDatabase('Email', 'Device Status Update', body, device.email, null, 0);
      }
    });

    connection.end();
  });
}

const emailTransporter = nodemailer.createTransport({
  service: "smtp.gmail.com",
  auth: {
    user: "donotreplysenselive@gmail.com",
    pass: "qpcaneirrhrhqspt"
  }
});

function sendSMS(to, body) {
  twilioClient.messages
    .create({
      body: body,
      to: to,
      from: twilioPhoneNumber,
    })
    .then(() => {
      console.log('SMS sent successfully:', body);
    })
    .catch((err) => {
      console.error('Error sending SMS:', err);
    });
}

function sendEmail(to, body) {
  const mailOptions = {
    from: 'your_email_address',
    to: to,
    subject: 'Device Status Update',
    html: body, // Use the rendered HTML here
  };

  emailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
}

function renderEmailTemplate(devices) {
  const templateFilePath = path.join(__dirname, 'views', 'device-status.ejs');
  const template = fs.readFileSync(templateFilePath, 'utf-8');

  return ejs.render(template, { devices });
}

// Function to log information into the database
function logInfoToDatabase(type, subject, message, recipient, messageId, isRead) {
  const connection = mysql.createConnection(dbConfig);

  connection.query(
    'INSERT INTO info_twi (created_time, type, subject, message, recipient, message_id, isRead) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [new Date(), type, subject, message, recipient, messageId, isRead],
    (err, result) => {
      if (err) {
        console.error('Error inserting data into the database:', err);
      } else {
        console.log('Data inserted successfully:', result);
      }
      connection.end();
    }
  );
}

module.exports = { checkState, renderEmailTemplate };
