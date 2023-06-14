const express = require('express');
const router = express.Router();
const controller = require('./controller');

// Registration route
router.post('/register', controller.register);

// Login route
router.post('/login', controller.login);

router.get('/users', controller.fetchAllUsers);

module.exports = router;
