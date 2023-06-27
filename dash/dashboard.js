const bcrypt = require('bcrypt');
const db = require('../db');
const jwtUtils = require('../token/jwtUtils');
const CircularJSON = require('circular-json');
const secure = require('../token/secure');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

function userDevices(req, res){
	const companyEmail  =  req.params.companyEmail;
	const userCheckQuery = 'SELECT * FROM tms_users WHERE CompanyEmail = ?';
	db.query(userCheckQuery, [companyEmail], (error, userCheckResult) => {
    if (error) {
      console.error('Error during token verification:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (userCheckResult.length === 0) {
        console.log('User not Found!');
        return res.status(400).json({ message: 'User not Found!' });
      }

      // Token matches, update the user's status as verified
      const devicesQuery = "SELECT * from tms_data where CompanyEmail = ?";
      db.query(devicesQuery, [companyEmail], (error, devices) => {
        if (error) {
        	console.error("Fetching Devices", error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ devices});
        console.log(devices);
      });
    } catch (error) {
    	console.error("Fetching User", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}


module.exports = {
	userDevices
};