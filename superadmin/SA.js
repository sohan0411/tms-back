const bcrypt = require('bcrypt');
const db = require('../db');
const jwtUtils = require('../token/jwtUtils');
const CircularJSON = require('circular-json');
const secure = require('../token/secure');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');


function fetchAllUsers(req, res) {
    try {
      const query = 'SELECT * FROM tms_users';
      db.query(query, (error, rows) => {
        if (error) {
          throw new Error('Error fetching users');
        }
        const encryptedUsers = secure.encryptData(rows, encryptKey);
  
        res.json({ users: rows });
        /*res.json({ users: encryptedUsers });*/
        console.log(rows);
        console.log(encryptedUsers)
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  function fetchAllDevices(req, res) {
    try {
      const query = 'SELECT * FROM tms_devices';
      db.query(query, (error, rows) => {
        if (error) {
          throw new Error('Error fetching devices');
        }
        res.json({ devices: rows });
        console.log(rows);
      });
    } catch (error) {
      console.error('Error fetching Devices:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }


  //DEVICES
  function addDevice(req, res) {
    try {
      const { EntryId, DeviceUID, DeviceLocation, DeviceName, CompanyEmail, CompanyName } = req.body;
      const createDeviceQuery = 'INSERT INTO tms_devices (EntryId, DeviceUID, DeviceLocation, DeviceName, CompanyEmail, CompanyName) VALUES (?, ?, ?, ?, ?, ?)';
  
      db.query(createDeviceQuery, [EntryId, DeviceUID, DeviceLocation, DeviceName, CompanyEmail, CompanyName], (error, result) => {
        if (error) {
          console.error('Error adding device:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        res.json({ message: 'Device added successfully' });
      });
    } catch (error) {
      console.error('Error adding device:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  function getDeviceByUID(req, res) {
    try {
      const deviceUID = req.params.deviceUID;
      const getDeviceByIdQuery = 'SELECT * FROM tms_devices WHERE DeviceUID = ?';
  
      db.query(getDeviceByIdQuery, [deviceUID], (error, result) => {
        if (error) {
          console.error('Error fetching device:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        if (result.length === 0) {
          return res.status(404).json({ message: 'Device not found' });
        }
  
        res.json(result[0]);
      });
    } catch (error) {
      console.error('Error fetching device:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  function updateDevice(req, res) {
    try {
      const deviceUID = req.params.deviceUID;
      const { EntryId, DeviceLocation, DeviceName, CompanyEmail, CompanyName } = req.body;
      const updateDeviceQuery =
        'UPDATE tms_devices SET EntryId=?, DeviceLocation=?, DeviceName=?, CompanyEmail=?, CompanyName=? WHERE DeviceUID=?';
  
      db.query(
        updateDeviceQuery,
        [EntryId, DeviceLocation, DeviceName, CompanyEmail, CompanyName, deviceUID],
        (error, result) => {
          if (error) {
            console.error('Error updating device:', error);
            return res.status(500).json({ message: 'Internal server error' });
          }
  
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Device not found' });
          }
  
          res.json({ message: 'Device updated successfully' });
        }
      );
    } catch (error) {
      console.error('Error updating device:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  function deleteDevice(req, res) {
    try {
      const deviceUID = req.params.deviceUID;
      const deleteDeviceQuery = 'DELETE FROM tms_devices WHERE DeviceUID = ?';
  
      db.query(deleteDeviceQuery, [deviceUID], (error, result) => {
        if (error) {
          console.error('Error deleting device:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Device not found' });
        }
  
        res.json({ message: 'Device deleted successfully' });
      });
    } catch (error) {
      console.error('Error deleting device:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }


 
  function fetchCompanyDetails(req, res) {
    const CompanyEmail = req.params.CompanyEmail;
    const companyQuery = 'SELECT CompanyName, ContactNo, Location, Designation FROM tms_users WHERE CompanyEmail = ?';
  
    db.query(companyQuery, [CompanyEmail], (error, companyResult) => {
      if (error) {
        console.error('Error fetching company details:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      if (companyResult.length === 0) {
        console.log('company not found!');
        return res.status(404).json({ message: 'company not found!' });
      }
  
      const company = companyResult[0];
      res.json({ companyDetails: company });
    });
  }

  function fetchCounts(req, res) {
    const CompanyEmail = req.params.CompanyEmail;
    const standardUserCountQuery = 'SELECT COUNT(*) AS standardUserCount FROM tms_users WHERE CompanyEmail = ? AND UserType = "Standard"';
    const adminCountQuery = 'SELECT COUNT(*) AS adminCount FROM tms_users WHERE CompanyEmail = ? AND UserType = "Admin"';
    const deviceCountQuery = 'SELECT COUNT(*) AS deviceCount FROM tms_devices WHERE CompanyEmail = ?';
    const userCountQuery = 'SELECT COUNT(*) AS userCount FROM tms_users WHERE CompanyEmail = ?';
  
    try {
      db.query(standardUserCountQuery, [CompanyEmail], (error, standardUserResult) => {
        if (error) {
          console.error('Error fetching standard user count:', error);
          throw new Error('Internal server error');
        }
  
        const standardUserCount = standardUserResult[0].standardUserCount;
  
        db.query(adminCountQuery, [CompanyEmail], (error, adminResult) => {
          if (error) {
            console.error('Error fetching admin count:', error);
            throw new Error('Internal server error');
          }
  
          const adminCount = adminResult[0].adminCount;
  
          db.query(deviceCountQuery, [CompanyEmail], (error, deviceResult) => {
            if (error) {
              console.error('Error fetching device count:', error);
              throw new Error('Internal server error');
            }
  
            const deviceCount = deviceResult[0].deviceCount;
  
            db.query(userCountQuery, [CompanyEmail], (error, userResult) => {
              if (error) {
                console.error('Error fetching user count:', error);
                throw new Error('Internal server error');
              }
  
              const userCount = userResult[0].userCount;
  
              res.json({
                standardUserCount: standardUserCount,
                adminCount: adminCount,
                deviceCount: deviceCount,
                userCount: userCount,
              });
            });
          });
        });
      });
    } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  
module.exports = {
  fetchAllUsers,
  fetchAllDevices,
  fetchCompanyDetails,
  addDevice,
  getDeviceByUID,
  updateDevice,
  deleteDevice,
  fetchCounts,
  //deleteDevice  
};