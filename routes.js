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

router.get('/device-trigger/:deviceId', dashboard.fetchDeviceTrigger);

router.get('/user-devices-trigger/:CompanyEmail', dashboard.fetchAllDeviceTrigger);

router.get('/data/:deviceId/intervals', dashboard.getDataByTimeInterval);

router.get('/data/:deviceId', dashboard.getDataByCustomDate);

router.get('/dataStatus/:deviceId/intervals', dashboard.getDataByTimeIntervalStatus);

router.get('/dataStatus/:deviceId', dashboard.getDataByCustomDateStatus);

router.get('/live-device-detail/:deviceId', dashboard.getDeviceDetails);

router.get('/live-device-status/:deviceId', dashboard.getLiveStatusDetails);

router.get('/user-data/:userId', dashboard.getUserData);

router.post('/new-message', dashboard.insertNewMessage);

router.put('/mark-read-message/:messageId', dashboard.markMessageAsRead);

router.delete('/delete-message/:messageId', dashboard.deleteMessage);

router.get('/unread-message/:receiver', dashboard.countUnreadMessages);

router.get('/messages/:receiver', dashboard.getUserMessages);


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

module.exports = router;
