const express = require('express');
const router = express.Router();
const authentication = require('./auth/authentication');

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

module.exports = router;
