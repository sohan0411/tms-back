const express = require('express');
const router = express.Router();
const authentication = require('./auth/authentication');
const dashboard = require('./dash/dashboard.js');
// Registration route
router.post('/register', authentication.register);

// Login route
router.post('/login', authentication.login);

router.get('/user', authentication.getUserDetails);


router.get('/users', authentication.fetchAllUsers);

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

router.get('/user-devices-trigger/:CompanyEmail', dashboard.fetchAllDeviceTriggers);

module.exports = router;
