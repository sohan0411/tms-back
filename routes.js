const express = require('express');
const router = express.Router();
const authentication = require('./auth/authentication');
const dashboard = require('./dash/dashboard.js');
const SA = require('./superadmin/SA.js');
const limitter = require('express-rate-limit');


const registerLimitter = limitter({
    windowMS : 5*60*1000,
    max: 2,
})

// Registration route
router.post('/register',registerLimitter, authentication.register);

const loginLimit = limitter({
    windowMS : 1*60*1000,
    max: 5,
})
// Login route
router.post('/login', loginLimit,authentication.login);

router.get('/user', authentication.getUserDetails);

router.post('/verify', authentication.verifyToken);

router.post('/re-verify-mail', authentication.resendToken);

router.post('/forgot', authentication.forgotPassword);

router.post('/resend-forgot', authentication.resendResetToken);

router.post('/reset-password', authentication.resetPassword);


//Dashboard

//fetching the devices using its email
router.get('/userdevices/:companyEmail', dashboard.userDevices);

//updating a device by its deviceid
router.put('/editDevice/:deviceId', dashboard.editDevice);

//update company details
router.put('/companyDetails/:UserId', dashboard.companyDetails);

//update personaldetails
router.put('/personalDetails/:UserId', dashboard.personalDetails);

//update password
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

router.get('/Company-users/:CompanyEmail', (req, res) => {
  dashboard.fetchCompanyUser(req, res);
  setInterval(() => dashboard.fetchCompanyUser(req, res), 5000);
});


//SA

// Fetch all devices
router.get('/fetchAllDevices', SA.fetchAllDevices);


// Fetch all users
router.get('/fetchAllUsers', SA.fetchAllUsers);


// Add a new device
router.post('/addDevice', SA.addDevice);


// Get a device by its unique deviceUID
router.get('/getDeviceByUID/:deviceUID', SA.getDeviceByUID);


// Update a device by its deviceUID
router.put('/updateDevice/:deviceUID', SA.updateDevice);


// Delete a device by its deviceUID
router.delete('/deleteDevice/:deviceUID', SA.deleteDevice);


//fetch company details by its email
router.get('/fetchCompanyDetails/:CompanyEmail', SA.fetchCompanyDetails);


//fetch standardUserCount,adminCount, deviceCount, userCount
router.get('/fetchCounts/:CompanyEmail', SA.fetchCounts);

module.exports = router;
