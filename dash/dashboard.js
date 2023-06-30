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


function editDeviceTrigger(req, res) {
  const deviceId = req.params.deviceId;
  const { TriggerValue, CompanyEmail}  = req.body; 
  const deviceCheckQuery = 'SELECT * FROM tms_trigger WHERE DeviceId = ?';

  db.query(deviceCheckQuery, [deviceId], (error, deivceCheckResult) => {
    if (error) {
      console.error('Error during device check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (deivceCheckResult.length === 0) {
        const insertTriggerQuery = 'INSERT INTO tms_trigger (DeviceId, TriggerValue ,CompanyEmail) VALUES (?,?,?)';

        db.query(insertTriggerQuery, [deviceId, TriggerValue, CompanyEmail], (error, insertDevice) => {
          if (error) {
            console.error('Error While Inserting Device:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }

          return res.json({ message: 'Device added SuccessFully!' });
        });
      } else {

        const UpdateDeviceTrigger = 'Update tms_trigger SET TriggerValue = ?, CompanyEmail = ? WHERE DeviceId = ?';

        db.query(UpdateDeviceTrigger, [DiviceLocation, CompanyUID, deviceId], (error, devices) => {
          if (error) {
            console.error('Error fetching devices:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }

          res.json({ message: 'Device Updated SuccessFully' });
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });



module.exports = {
	userDevices,
  editDevice,
  editDeviceTrigger
};