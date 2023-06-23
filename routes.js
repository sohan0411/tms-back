const express = require('express');
const router = express.Router();
const authentication = require('./auth/authentication');

// Registration route
router.post('/register', authentication.register);

// Login route
router.post('/login', authentication.login);

router.get('/user', authentication.getUserDetails);


router.get('/users', authentication.fetchAllUsers);


module.exports = router;
