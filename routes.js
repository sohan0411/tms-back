const express = require('express');
const router = express.Router();
const authentication = require('./auth/authentication');
const dashboard = require('./dash/dashboard.js');
const SA = require('./superadmin/SA.js');


// Registration route
router.post('/register', authentication.register);

// Login route
router.post('/login', authentication.login);

router.get('/user', authentication.getUserDetails);


//router.get('/users', authentication.fetchAllUsers);

router.post('/verify', authentication.verifyToken);

router.post('/re-verify-mail', authentication.resendToken);

router.post('/forgot', authentication.forgotPassword);

router.post('/resend-forgot', authentication.resendResetToken);

router.post('/reset-password', authentication.resetPassword);


//Dashboard

router.get('/userdevices/:companyEmail', dashboard.userDevices);

router.put('/editDevice/:deviceId', dashboard.editDevice);

router.put('/companyDetails/:UserId', dashboard.companyDetails);

router.put('/personalDetails/:UserId', dashboard.personalDetails);

router.put('/updatePassword/:UserId', dashboard.updatePassword);

router.put('/editDeviceTrigger/:deviceId', dashboard.editDeviceTrigger);

router.get('/device-trigger/:deviceId', dashboard.fetchDeviceTriggers);

router.get('/user-devices-trigger/:CompanyEmail', dashboard.fetchAllDeviceTrigger);

/*router.get('/fetchTriggers/:companyEmail', dashboard.fetchTriggers);

router.get('/TimeInterval/:deviceId', dashboard.TimeInterval);*/

//SA

// Fetch all devices
router.get('/fetchAllDevices', SA.fetchAllDevices);

// Fetch all users
router.get('/fetchAllUsers', SA.fetchAllUsers);

// Add a new device
router.post('/addDevice', SA.addDevice);

// Get a device by its unique identifier
router.get('/getDeviceByUID/:deviceUID', SA.getDeviceByUID);

// Update a device by its unique identifier
router.put('/updateDevice/:deviceUID', SA.updateDevice);

// Delete a device by its unique identifier
router.delete('/deleteDevice/:deviceUID', SA.deleteDevice);

//fetch company details
router.get('/fetchCompanyDetails/:deviceUID', SA.fetchCompanyDetails);


module.exports = router;
