const bcrypt = require('bcrypt');
const db = require('../db');
const jwtUtils = require('../token/jwtUtils');
const CircularJSON = require('circular-json');
const secure = require('../token/secure');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');


function userDevices(req, res) {
  const companyEmail = req.params.companyEmail;
  const userCheckQuery = 'SELECT * FROM tms_users WHERE CompanyEmail = ?';

  db.query(userCheckQuery, [companyEmail], (error, userCheckResult) => {
    if (error) {
      console.error('Error during user check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (userCheckResult.length === 0) {
        console.log('User not found!');
        return res.status(400).json({ message: 'User not found!' });
      }

      const devicesQuery = 'SELECT * from tms_data WHERE CompanyEmail = ?';

      db.query(devicesQuery, [companyEmail], (error, devices) => {
        if (error) {
          console.error('Error fetching devices:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ devices });
        console.log(devices);
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function editDevice(req, res) {
  const deviceId = req.params.deviceId;
  const { DiviceLocation, CompanyUID}  = req.body; 
  const deviceCheckQuery = 'SELECT * FROM tms_data WHERE DiviceId = ?';

  db.query(deviceCheckQuery, [deviceId], (error, deivceCheckResult) => {
    if (error) {
      console.error('Error during device check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (deivceCheckResult.length === 0) {
        console.log('User not found!');
        return res.status(400).json({ message: 'Device not found!' });
      }

      const devicesQuery = 'Update tms_data SET DiviceLocation = ?, CompanyUID = ? WHERE DiviceId = ?';

      db.query(devicesQuery, [DiviceLocation, CompanyUID, deviceId], (error, devices) => {
        if (error) {
          console.error('Error fetching devices:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Device Updated SuccessFully' });
        console.log(devices);
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function companyDetails(req, res) {
  const UserId = req.params.UserId;
  const { CompanyName, ContactNo, Location, Designation}  = req.body; 
  const userCheckQuery = 'SELECT * FROM tms_users WHERE UserId = ?';

  db.query(userCheckQuery, [UserId], (error, useridCheckResult) => {
    if (error) {
      console.error('Error during UserId check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (useridCheckResult.length === 0) {
        console.log('User not found!');
        return res.status(400).json({ message: 'User not found!' });
      }

      const userQuery = 'Update tms_users SET CompanyName=?, ContactNo=?, Location=?, Designation=? WHERE UserId=?';

      db.query(userQuery, [CompanyName, ContactNo, Location, Designation, UserId],(error, details) => {
        if (error) {
          console.error('Error fetching devices:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Company details Updated SuccessFully' });
        console.log(details);
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}



function personalDetails(req, res) {
  const UserId = req.params.UserId;
  const {FirstName, LastName}  = req.body; 
  const userCheckQuery = 'SELECT * FROM tms_users WHERE UserId = ?';

  db.query(userCheckQuery, [UserId], (error, useridCheckResult) => {
    if (error) {
      console.error('Error during UserId check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (useridCheckResult.length === 0) {
        console.log('User not found!');
        return res.status(400).json({ message: 'User not found!' });
      }

      const userdetailQuery = 'Update tms_users SET FirstName=?, LastName=? WHERE UserId=?';

      db.query(userdetailQuery, [FirstName, LastName, UserId],(error, details) => {
        if (error) {
          console.error('Error fetching devices:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Personal details Updated SuccessFully' });
        console.log(details);
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}


function updatePassword(req, res) {
  const UserId = req.params.UserId;
  const { Password } = req.body;

  // Check if the user exists in the database
  const userCheckQuery = 'SELECT * FROM tms_users WHERE UserId = ?';
  db.query(userCheckQuery, [UserId], (error, useridCheckResult) => {
    try {
      if (error) {
        console.error('Error during UserId check:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (useridCheckResult.length === 0) {
        console.log('User not found!');
        return res.status(400).json({ message: 'User not found!' });
      }

      // Hash the new password
      const hashedPassword = bcrypt.hashSync(Password, 10);

      // Update the user's password in the database
      const updatePasswordQuery = 'UPDATE tms_users SET Password = ? WHERE UserId = ?';
      db.query(updatePasswordQuery, [hashedPassword, UserId], (error, result) => {
        if (error) {
          console.error('Error updating password:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Password updated successfully' });
        console.log(result);
      });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}



function editDeviceTrigger(req, res) {
  const deviceId = req.params.deviceId;
  const { TriggerValue, CompanyEmail } = req.body;
  const deviceCheckQuery = 'SELECT * FROM tms_trigger WHERE DeviceId = ?';

  db.query(deviceCheckQuery, [deviceId], (error, deviceCheckResult) => {
    if (error) {
      console.error('Error during device check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (deviceCheckResult.length === 0) {
        const insertTriggerQuery = 'INSERT INTO tms_trigger (DeviceId, TriggerValue, CompanyEmail) VALUES (?,?,?)';

        db.query(insertTriggerQuery, [deviceId, TriggerValue, CompanyEmail], (error, insertResult) => {
          if (error) {
            console.error('Error while inserting device:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }

          return res.json({ message: 'Device added successfully!' });
        });
      } else {
        const updateDeviceTriggerQuery = 'UPDATE tms_trigger SET TriggerValue = ?, CompanyEmail = ? WHERE DeviceId = ?';

        db.query(updateDeviceTriggerQuery, [TriggerValue, CompanyEmail, deviceId], (error, updateResult) => {
          if (error) {
            console.error('Error updating device trigger:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }

          return res.json({ message: 'Device updated successfully' });
        });
      }
    } catch (error) {
      console.error('Error in device check:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}


function fetchTriggers(req, res) {
  const companyEmail = req.params.companyEmail;
  const userCheckQuery = 'SELECT * FROM tms_trigger WHERE CompanyEmail = ?';

  db.query(userCheckQuery, [companyEmail], (error, userCheckResult) => {
    if (error) {
      console.error('Error during user check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (userCheckResult.length === 0) {
        console.log('User not found!');
        return res.status(400).json({ message: 'User not found!' });
      }

      const triggersQuery = 'SELECT * from tms_trigger WHERE CompanyEmail = ?';

      db.query(triggersQuery, [companyEmail], (error, triggers) => {
        if (error) {
          console.error('Error fetching Triggers:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ triggers });
        console.log(triggers);
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function TimeInterval(req, res){
  const deviceId = req.params.deviceId;
  const timeInterval = req.query.interval;

  let duration;
  switch (timeInterval) {
    case '30sec':
      duration = 'INTERVAL 30 SECOND';
      break;
    case '1min':
      duration = 'INTERVAL 1 MINUTE';
      break;
    case '2min':
      duration = 'INTERVAL 2 MINUTES';
      break;
    case '5min':
      duration = 'INTERVAL 5 MINUTE';
      break;
    case '10min':
      duration = 'INTERVAL 10 MINUTE';
      break;
    case '30min':
      duration = 'INTERVAL 30 MINUTE';
      break;
    case '1hour':
      duration = 'INTERVAL 1 HOUR';
      break;
    case '2hour':
      duration = 'INTERVAL 2 HOUR';
      break;
    case '10hour':
        duration = 'INTERVAL 10 HOUR';
        break;
    case '12hour':
      duration = 'INTERVAL 12 HOUR';
      break;
    case '1day':
      duration = 'INTERVAL 1 DAY';
      break;
    case '7days':
      duration = 'INTERVAL 7 DAY';
      break;

    case '30days':
        duration = 'INTERVAL 30 DAY';
        break;

    default:
      return res.status(400).json({ message: 'Invalid time interval' });
  }

  const sql = `SELECT * FROM actual_data WHERE DeviceUID = ? AND Timestamp >= DATE_SUB(NOW(), ${duration})`;
  db.query(sql, [deviceId], (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.json({ data: results });
  });
}





module.exports = {
	userDevices,
  editDevice,
  companyDetails,
  personalDetails,
  updatePassword,
  editDeviceTrigger,
  fetchTriggers,
  TimeInterval,
};