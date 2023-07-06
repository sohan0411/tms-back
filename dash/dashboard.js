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

      const devicesQuery = 'SELECT * from tms_devices WHERE CompanyEmail = ?';

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


function fetchDeviceTriggers(req, res) {
  const CompanyEmail = req.params.body;
  try {
    const query = 'SELECT * FROM tms_triggers where CompanyEmail = ?';
    db.query(query, [CompanyEmail], (error, devices) => {
      if (error) {
        throw new Error('Error fetching devices');
      }

      res.json({ devices: devices });
      /*res.json({ users: encryptedUsers });*/
      console.log(devices);
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function editDevice(req, res) {
  const deviceId = req.params.deviceId;
  const { DeviceLocation, DeviceName}  = req.body; 
  const deviceCheckQuery = 'SELECT * FROM tms_devices WHERE DeviceUID = ?';

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

      const devicesQuery = 'Update tms_devices SET DeviceLocation = ?, DeviceName = ? WHERE DeviceUID = ?';

      db.query(devicesQuery, [DeviceLocation, DeviceName, deviceId], (error, devices) => {
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


function fetchDeviceTrigger(req, res){
  const deviceId = req.params.deviceId;
  const deviceTriggerQuery = 'select * from tms_trigger where DeviceUID = ?';

    try {
      db.query(deviceTriggerQuery, [deviceId], (error, devicetriggerkResult) => {
        if (error) {
          console.error('Error during device check:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.status(200).json(devicetriggerkResult);
      });
    } catch (error) {
      console.error('Error in device check:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
}

function fetchAllDeviceTrigger(req, res){
  const CompanyEmail = req.params.CompanyEmail;
  const deviceTriggerQuery = 'select * from tms_trigger where CompanyEmail = ?';

    try {
      db.query(deviceTriggerQuery, [CompanyEmail], (error, devicetriggerkResult) => {
        if (error) {
          console.error('Error during device check:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.status(200).json(devicetriggerkResult);
      });
    } catch (error) {
      console.error('Error in device check:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
}


function editDeviceTrigger(req, res) {
  const deviceId = req.params.deviceId;
  const { TriggerValue, CompanyEmail } = req.body;
  const deviceCheckQuery = 'SELECT * FROM tms_trigger WHERE DeviceUID = ?';

  db.query(deviceCheckQuery, [deviceId], (error, deviceCheckResult) => {
    if (error) {
      console.error('Error during device check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (deviceCheckResult.length === 0) {
        const insertTriggerQuery = 'INSERT INTO tms_trigger (DeviceUID, TriggerValue, CompanyEmail) VALUES (?,?,?)';

        db.query(insertTriggerQuery, [deviceId, TriggerValue, CompanyEmail], (error, insertResult) => {
          if (error) {
            console.error('Error while inserting device:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }

          return res.json({ message: 'Device added successfully!' });
        });
      } else {
        const updateDeviceTriggerQuery = 'UPDATE tms_trigger SET TriggerValue = ?, CompanyEmail = ? WHERE DeviceUID = ?';

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

module.exports = {
	userDevices,
  editDevice,
  fetchDeviceTriggers,
  fetchAllDeviceTrigger,
  companyDetails,
  personalDetails,
  updatePassword,
  editDeviceTrigger,  
};