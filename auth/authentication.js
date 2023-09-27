const bcrypt = require('bcrypt');
const db = require('../db');
const jwtUtils = require('../token/jwtUtils');
const CircularJSON = require('circular-json');
const secure = require('../token/secure');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { logExecution } = require('../superadmin/SA');
const { v4: uuidv4 } = require('uuid');

encryptKey = "SenseLive-Tms-Dashboard";

// Function to send an email with the token
function sendTokenEmail(email, token, firstName, lastName) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'kpohekar19@gmail.com',
      pass: 'woptjevenzhqmrpp',
    },
  });

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('sendTokenEmail', tenantId, 'INFO', 'Sending registration token email');

  // Read the email template file
  const templatePath = path.join(__dirname, '../mail-body/email-template.ejs');
  fs.readFile(templatePath, 'utf8', (err, templateData) => {
    if (err) {
      console.error('Error reading email template:', err);

      // Log the error
      logExecution('sendTokenEmail', tenantId, 'ERROR', 'Error reading email template');
      return;
    }

    // Compile the email template with EJS
    const compiledTemplate = ejs.compile(templateData);

    // Render the template with the token and recipient's name
    const html = compiledTemplate({ token, firstName, lastName });

    const mailOptions = {
      from: 'your-email@example.com', // Replace with the sender's email address
      to: email,
      subject: 'Registration Token',
      html: html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);

        // Log the error
        logExecution('sendTokenEmail', tenantId, 'ERROR', 'Error sending email');
      } else {
        console.log('Email sent:', info.response);

        // Log the success
        logExecution('sendTokenEmail', tenantId, 'INFO', 'Email sent successfully');
      }
    });
  });
}

function sendTokenDashboardEmail(email, token) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'kpohekar19@gmail.com',
      pass: 'woptjevenzhqmrpp',
    },
  });

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('sendTokenDashboardEmail', tenantId, 'INFO', 'Sending dashboard token email');

  // Read the email template file
  const templatePath = path.join(__dirname, '../mail-body/email-template.ejs');
  fs.readFile(templatePath, 'utf8', (err, templateData) => {
    if (err) {
      console.error('Error reading email template:', err);

      // Log the error
      logExecution('sendTokenDashboardEmail', tenantId, 'ERROR', 'Error reading email template');
      return;
    }

    // Compile the email template with EJS
    const compiledTemplate = ejs.compile(templateData);

    // Render the template with the token
    const html = compiledTemplate({ token });

    const mailOptions = {
      from: 'your-email@example.com',
      to: email,
      subject: 'Registration Token',
      html: html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);

        // Log the error
        logExecution('sendTokenDashboardEmail', tenantId, 'ERROR', 'Error sending email');
      } else {
        console.log('Email sent:', info.response);

        // Log the success
        logExecution('sendTokenDashboardEmail', tenantId, 'INFO', 'Email sent successfully');
      }
    });
  });
}

function sendResetTokenEmail(personalEmail, resetToken) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'kpohekar19@gmail.com',
      pass: 'woptjevenzhqmrpp',
    },
  });

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('sendResetTokenEmail', tenantId, 'INFO', 'Sending reset token email');

  // Read the email template file
  const templatePath = path.join(__dirname, '../mail-body/email-template-forgot-password.ejs');
  fs.readFile(templatePath, 'utf8', (err, templateData) => {
    if (err) {
      console.error('Error reading email template:', err);

      // Log the error
      logExecution('sendResetTokenEmail', tenantId, 'ERROR', 'Error reading email template');
      return;
    }

    // Compile the email template with EJS
    const compiledTemplate = ejs.compile(templateData);

    // Render the template with the reset token
    const html = compiledTemplate({ resetToken });

    const mailOptions = {
      from: 'kpohekar19@gmail.com',
      to: personalEmail,
      subject: 'Reset Password Link',
      html: html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);

        // Log the error
        logExecution('sendResetTokenEmail', tenantId, 'ERROR', 'Error sending email');
      } else {
        console.log('Email sent:', info.response);

        // Log the success
        logExecution('sendResetTokenEmail', tenantId, 'INFO', 'Email sent successfully');
      }
    });
  });
}

// Function to handle user registration
function register(req, res, tenantId) {
  const {
    companyName,
    companyEmail,
    contact,
    location,
    firstName,
    lastName,
    personalEmail,
    designation,
    password,
  } = req.body;

  // Combine firstName and lastName to create the user's name
  const name = `${firstName} ${lastName}`;

  // Log the start of the function execution
  logExecution('register', tenantId, 'INFO', 'User registration attempt');

  // Check if the company email is already registered
  const emailCheckQuery = 'SELECT * FROM tms_users WHERE CompanyEmail = ?';
  db.query(emailCheckQuery, [companyEmail], (error, emailCheckResult) => {
    if (error) {
      // Log the error and return a response
      logExecution('register', tenantId, 'ERROR', 'Error during email check: ' + error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (emailCheckResult.length > 0) {
        // Log the error and return a response
        logExecution('register', tenantId, 'INFO', 'Company email already exists');
        return res.status(400).json({ message: 'Company email already exists' });
      }

      // Check if the username (company email) is already registered
      const personalEmailCheckQuery = 'SELECT * FROM tms_users WHERE PersonalEmail = ?';
      db.query(personalEmailCheckQuery, [personalEmail], (error, personalEmailCheckResult) => {
        if (error) {
          // Log the error and return a response
          logExecution('register', tenantId, 'ERROR', 'Error during username check: ' + error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        try {
          if (personalEmailCheckResult.length > 0) {
            // Log the error and return a response
            logExecution('register', tenantId, 'INFO', 'Username already exists');
            return res.status(400).json({ message: 'User already exists' });
          }

          // Generate a unique 10-digit user ID
          const userId = generateUserId();

          // Hash the password
          bcrypt.hash(password, 10, (error, hashedPassword) => {
            if (error) {
              // Log the error and return a response
              logExecution('register', tenantId, 'ERROR', 'Error during password hashing: ' + error);
              return res.status(500).json({ message: 'Internal server error' });
            }

            try {
              // Generate a verification token
              const verificationToken = jwtUtils.generateToken({ personalEmail: personalEmail });

              // Insert the user into the database
              const insertQuery =
                'INSERT INTO tms_users (UserId, Username, FirstName, LastName, CompanyName, CompanyEmail, ContactNo, Location, UserType, PersonalEmail, Password, Designation, VerificationToken, Verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
              db.query(
                insertQuery,
                [
                  userId,
                  personalEmail,
                  firstName,
                  lastName,
                  companyName,
                  companyEmail,
                  contact,
                  location,
                  'Admin',
                  personalEmail,
                  hashedPassword,
                  designation,
                  verificationToken,
                  '0'
                ],
                (error, insertResult) => {
                  if (error) {
                    // Log the error and return a response
                    logExecution('register', tenantId, 'ERROR', 'Error during user insertion: ' + error);
                    return res.status(500).json({ message: 'Internal server error' });
                  }

                  try {
                    // Send the verification token to the user's email
                    sendTokenEmail(personalEmail, verificationToken, firstName, lastName);

                    // Log the success message and return a response
                    logExecution('register', tenantId, 'INFO', 'User registered successfully');
                    res.json({ message: 'Registration successful. Check your email for the verification token.' });
                  } catch (error) {
                    // Log the error and return a response
                    logExecution('register', tenantId, 'ERROR', 'Error sending verification token: ' + error);
                    res.status(500).json({ message: 'Internal server error' });
                  }
                }
              );
            } catch (error) {
              // Log the error and return a response
              logExecution('register', tenantId, 'ERROR', 'Error during registration: ' + error);
              res.status(500).json({ message: 'Internal server error' });
            }
          });
        } catch (error) {
          // Log the error and return a response
          logExecution('register', tenantId, 'ERROR', 'Error during registration: ' + error);
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    } catch (error) {
      // Log the error and return a response
      logExecution('register', tenantId, 'ERROR', 'Error during registration: ' + error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}




function register_dashboard(req, res) {
  const {
    companyName,
    companyEmail,
    contact,
    location,
    firstName,
    lastName,
    personalEmail,
    designation,
    password,
    userType
  } = req.body;

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('register_dashboard', tenantId, 'INFO', 'User registration attempt');

  // Check if the username (company email) is already registered
  const personalEmailCheckQuery = 'SELECT * FROM tms_users WHERE PersonalEmail = ?';
  db.query(personalEmailCheckQuery, [personalEmail], (error, personalEmailCheckResult) => {
    try {
      if (error) {
        console.error('Error during username check:', error);
        // Log the error
        logExecution('register_dashboard', tenantId, 'ERROR', 'Error during username check');
        throw new Error('Error during username check');
      }

      if (personalEmailCheckResult.length > 0) {
        // Log the end of the function execution with an error message
        logExecution('register_dashboard', tenantId, 'ERROR', 'User already exists');
        console.log('Username already exists');
        return res.status(400).json({ message: 'User already exists' });
      }

      // Generate a unique 10-digit user ID
      const userId = generateUserId();

      // Hash the password
      bcrypt.hash(password, 10, (error, hashedPassword) => {
        try {
          if (error) {
            console.error('Error during password hashing:', error);
            // Log the error
            logExecution('register_dashboard', tenantId, 'ERROR', 'Error during password hashing');
            throw new Error('Error during password hashing');
          }

          // Generate a verification token
          const verificationToken = jwtUtils.generateToken({ personalEmail: personalEmail });

          // Insert the user into the database
          const insertQuery =
            'INSERT INTO tms_users (UserId, Username, FirstName, LastName, CompanyName, CompanyEmail, ContactNo, Location, UserType, PersonalEmail, Password, Designation, VerificationToken, Verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
          db.query(
            insertQuery,
            [
              userId,
              personalEmail,
              firstName,
              lastName,
              companyName,
              companyEmail,
              contact,
              location,
              userType,
              personalEmail,
              hashedPassword,
              designation,
              verificationToken,
              '0'
            ],
            (error, insertResult) => {
              try {
                if (error) {
                  console.error('Error during user insertion:', error);
                  // Log the error
                  logExecution('register_dashboard', tenantId, 'ERROR', 'Error during user insertion');
                  throw new Error('Error during user insertion');
                }

                // Send the verification token to the user's email
                sendTokenDashboardEmail(personalEmail, verificationToken);

                // Log the end of the function execution with a success message
                logExecution('register_dashboard', tenantId, 'INFO', 'User registered successfully');
                console.log('User registered successfully');
                res.json({ message: 'Registration successful. Check your email for the verification token.' });
              } catch (error) {
                console.error('Error sending verification token:', error);
                // Log the error
                logExecution('register_dashboard', tenantId, 'ERROR', 'Error sending verification token');
                res.status(500).json({ message: 'Internal server error' });
              }
            }
          );
        } catch (error) {
          console.error('Error during registration:', error);
          // Log the error
          logExecution('register_dashboard', tenantId, 'ERROR', 'Internal server error');
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    } catch (error) {
      console.error('Error during registration:', error);
      // Log the error
      logExecution('register_dashboard', tenantId, 'ERROR', 'Internal server error');
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

// Function to handle token verification
function verifyToken(req, res) {
  const { token } = req.body;

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('verifyToken', tenantId, 'INFO', 'Token verification attempt');

  // Check if the token matches the one stored in the database
  const tokenCheckQuery = 'SELECT * FROM tms_users WHERE VerificationToken = ?';
  db.query(tokenCheckQuery, [token], (error, tokenCheckResult) => {
    if (error) {
      console.error('Error during token verification:', error);
      // Log the error
      logExecution('verifyToken', tenantId, 'ERROR', 'Error during token verification');
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (tokenCheckResult.length === 0) {
        console.log('Token verification failed');
        // Log the end of the function execution with an error message
        logExecution('verifyToken', tenantId, 'ERROR', 'Token verification failed');
        return res.status(400).json({ message: 'Token verification failed' });
      }

      // Token matches, update the user's status as verified
      const updateQuery = 'UPDATE tms_users SET Verified = ? WHERE VerificationToken = ?';
      db.query(updateQuery, [true, token], (error, updateResult) => {
        if (error) {
          console.error('Error updating user verification status:', error);
          // Log the error
          logExecution('verifyToken', tenantId, 'ERROR', 'Error updating user verification status');
          return res.status(500).json({ message: 'Internal server error' });
        }

        console.log('Token verification successful');
        // Log the end of the function execution with a success message
        logExecution('verifyToken', tenantId, 'INFO', 'Token verification successful');
        res.json({ message: 'Token verification successful. You can now log in.' });
      });
    } catch (error) {
      console.error('Error during token verification:', error);
      // Log the error
      logExecution('verifyToken', tenantId, 'ERROR', 'Error during token verification');
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}


// Function to resend the verification token

function resendToken(req, res) {
  const { personalEmail } = req.body;

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('resendToken', tenantId, 'INFO', 'Resending verification token attempt');

  // Check if the user is available
  const checkUserQuery = 'SELECT * FROM tms_users WHERE PersonalEmail = ?';
  db.query(checkUserQuery, [personalEmail], (error, userResult) => {
    if (error) {
      console.error('Error checking user availability:', error);
      // Log the error
      logExecution('resendToken', tenantId, 'ERROR', 'Error checking user availability');
      return res.status(500).json({ message: 'Internal server error' });
    }

    // If no user found, send an error response
    if (userResult.length === 0) {
      // Log the end of the function execution with an error message
      logExecution('resendToken', tenantId, 'ERROR', 'User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is already verified, send a bad request error response
    if (userResult[0].Verified === '1') {
      // Log the end of the function execution with an error message
      logExecution('resendToken', tenantId, 'ERROR', 'User already verified');
      return res.status(400).json({ message: 'User already verified' });
    } else {
      // Generate a new verification token
      const verificationToken = jwtUtils.generateToken({ personalEmail: personalEmail });

      // Update the user's verification token in the database
      const updateQuery = 'UPDATE tms_users SET VerificationToken = ? WHERE PersonalEmail = ?';
      db.query(updateQuery, [verificationToken, personalEmail], (error, updateResult) => {
        if (error) {
          console.error('Error updating verification token:', error);
          // Log the error
          logExecution('resendToken', tenantId, 'ERROR', 'Error updating verification token');
          return res.status(500).json({ message: 'Internal server error' });
        }

        try {
          // Send the new verification token to the user's email
          sendTokenEmail(personalEmail, verificationToken);

          console.log('Verification token resent');
          // Log the end of the function execution with a success message
          logExecution('resendToken', tenantId, 'INFO', 'Verification token resent');
          res.json({ message: 'Verification token resent. Check your email for the new token.' });
        } catch (error) {
          console.error('Error sending verification token:', error);
          // Log the error
          logExecution('resendToken', tenantId, 'ERROR', 'Error sending verification token');
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    }
  });
}


function login(req, res) {
  const { Username, Password } = req.body;

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('login', tenantId, 'INFO', 'User login attempt');

  // Check if the user exists in the database
  const query = 'SELECT * FROM tms_users WHERE Username = ?';
  db.query(query, [Username], (error, rows) => {
    try {
      if (error) {
        console.error('Error during login:', error);
        // Log the error
        logExecution('login', tenantId, 'ERROR', 'Error during login');
        throw new Error('Error during login');
      }

      if (rows.length === 0) {
        // Log the end of the function execution with an error message
        logExecution('login', tenantId, 'ERROR', 'User does not exist');
        return res.status(401).json({ message: 'User does not exist!' });
      }

      const user = rows[0];

      if (user.Verified === '0') {
        // Log the end of the function execution with an error message
        logExecution('login', tenantId, 'ERROR', 'User is not verified');
        return res.status(401).json({ message: 'User is not verified. Please verify your account.' });
      }

      if (user.block === 1) {
        // Log the end of the function execution with an error message
        logExecution('login', tenantId, 'ERROR', 'User is blocked');
        return res.status(401).json({ message: 'User is blocked. Please contact support.' });
      }

      // Compare the provided password with the hashed password in the database
      bcrypt.compare(Password, user.Password, (error, isPasswordValid) => {
        try {
          if (error) {
            console.error('Error during password comparison:', error);
            // Log the error
            logExecution('login', tenantId, 'ERROR', 'Error during password comparison');
            throw new Error('Error during password comparison');
          }

          if (!isPasswordValid) {
            // Log the end of the function execution with an error message
            logExecution('login', tenantId, 'ERROR', 'Invalid credentials');
            return res.status(401).json({ message: 'Invalid credentials' });
          }

          // Generate a JWT token
          const token = jwtUtils.generateToken({ Username: user.Username });

          // Log the end of the function execution with a success message
          logExecution('login', tenantId, 'INFO', 'User login successful');
          res.json({ token });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}



// User details endpoint
function getUserDetails(req, res) {
  const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('getUserDetails', tenantId, 'INFO', 'Fetching user details attempt');

  // Verify the token
  const decodedToken = jwtUtils.verifyToken(token);
  if (!decodedToken) {
    // Log the end of the function execution with an error message
    logExecution('getUserDetails', tenantId, 'ERROR', 'Invalid token');
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Fetch user details from the database using the decoded token information
  const query = 'SELECT * FROM tms_users WHERE Username = ?';
  db.query(query, [decodedToken.Username], (error, rows) => {
    if (error) {
      console.error(error);
      // Log the error
      logExecution('getUserDetails', tenantId, 'ERROR', 'Internal server error');
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (rows.length === 0) {
      // Log the end of the function execution with an error message
      logExecution('getUserDetails', tenantId, 'ERROR', 'User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    res.json(user);

    // Log the end of the function execution with a success message
    logExecution('getUserDetails', tenantId, 'INFO', 'User details fetched successfully');
  });
}





// Forgot password
function forgotPassword(req, res) {
  const { personalEmail } = req.body;

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('forgotPassword', tenantId, 'INFO', 'Forgot password attempt');

  // Check if the email exists in the database
  const query = 'SELECT * FROM tms_users WHERE PersonalEmail = ?';
  db.query(query, [personalEmail], (error, rows) => {
    try {
      if (error) {
        console.error('Error during forgot password:', error);
        // Log the error
        logExecution('forgotPassword', tenantId, 'ERROR', 'Error during forgot password');
        throw new Error('Error during forgot password');
      }

      if (rows.length === 0) {
        // Log the end of the function execution with an error message
        logExecution('forgotPassword', tenantId, 'ERROR', 'User not found');
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate a reset token
      const resetToken = jwtUtils.generateToken({ personalEmail: personalEmail });

      // Save the reset token in the database
      const userId = rows[0].UserId;
      const insertQuery = 'INSERT INTO tms_reset_tokens (UserId, token) VALUES (?, ?)';
      db.query(insertQuery, [userId, resetToken], (error, insertResult) => {
        try {
          if (error) {
            console.error('Error saving reset token:', error);
            // Log the error
            logExecution('forgotPassword', tenantId, 'ERROR', 'Error saving reset token');
            throw new Error('Error saving reset token');
          }

          // Send the reset token to the user's email
          sendResetTokenEmail(personalEmail, resetToken);

          console.log('Reset token sent to the user\'s email');
          // Log the end of the function execution with a success message
          logExecution('forgotPassword', tenantId, 'INFO', 'Reset token sent to the user\'s email');
          res.json({ message: 'Reset token sent to your email' });
        } catch (error) {
          console.error(error);
          // Log the error
          logExecution('forgotPassword', tenantId, 'ERROR', 'Internal server error');
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    } catch (error) {
      console.error(error);
      // Log the error
      logExecution('forgotPassword', tenantId, 'ERROR', 'Internal server error');
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}


function resendResetToken(req, res) {
  const { personalEmail } = req.body;

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('resendResetToken', tenantId, 'INFO', 'Resending reset token attempt');

  // Check if the user is available
  const checkUserQuery = 'SELECT * FROM tms_users WHERE PersonalEmail = ?';
  db.query(checkUserQuery, [personalEmail], (error, userResult) => {
    if (error) {
      console.error('Error checking user availability:', error);
      // Log the error
      logExecution('resendResetToken', tenantId, 'ERROR', 'Error checking user availability');
      return res.status(500).json({ message: 'Internal server error' });
    }

    // If no user found, send an error response
    if (userResult.length === 0) {
      // Log the end of the function execution with an error message
      logExecution('resendResetToken', tenantId, 'ERROR', 'User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new verification token
    const userId = userResult[0].UserId;
    const verificationToken = jwtUtils.generateToken({ personalEmail: personalEmail });

    // Update the user's verification token in the database
    const updateQuery = 'UPDATE tms_reset_tokens SET token = ? WHERE UserId = ?';
    db.query(updateQuery, [verificationToken, userId], (error, updateResult) => {
      if (error) {
        console.error('Error updating Resend link:', error);
        // Log the error
        logExecution('resendResetToken', tenantId, 'ERROR', 'Error updating Resend link');
        return res.status(500).json({ message: 'Internal server error' });
      }

      try {
        // Send the new verification token to the user's email
        sendResetTokenEmail(personalEmail, verificationToken);

        console.log('Resend link resent');
        // Log the end of the function execution with a success message
        logExecution('resendResetToken', tenantId, 'INFO', 'Resend link resent');
        res.json({ message: 'Resend link resent. Check your email for the new token.' });
      } catch (error) {
        console.error('Error sending verification token:', error);
        // Log the error
        logExecution('resendResetToken', tenantId, 'ERROR', 'Error sending verification token');
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  });
}


function resetPassword(req, res) {
  const { token, password } = req.body;

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('resetPassword', tenantId, 'INFO', 'Resetting password attempt');

  // Check if the email and reset token match in the database
  const query = 'SELECT * FROM tms_reset_tokens WHERE token = ?';
  db.query(query, [token], (error, rows) => {
    try {
      if (error) {
        console.error('Error during reset password:', error);
        // Log the error
        logExecution('resetPassword', tenantId, 'ERROR', 'Error during reset password');
        throw new Error('Error during reset password');
      }

      if (rows.length === 0) {
        // Log the end of the function execution with an error message
        logExecution('resetPassword', tenantId, 'ERROR', 'Invalid token');
        return res.status(401).json({ message: 'Invalid token' });
      }

      const userId = rows[0].UserId;

      // Hash the new password
      bcrypt.hash(password, 10, (error, hashedPassword) => {
        try {
          if (error) {
            console.error('Error during password hashing:', error);
            // Log the error
            logExecution('resetPassword', tenantId, 'ERROR', 'Error during password hashing');
            throw new Error('Error during password hashing');
          }

          // Update the password in the database
          const updateQuery = 'UPDATE tms_users SET Password = ? WHERE UserId = ?';
          db.query(updateQuery, [hashedPassword, userId], (error, updateResult) => {
            try {
              if (error) {
                console.error('Error updating password:', error);
                // Log the error
                logExecution('resetPassword', tenantId, 'ERROR', 'Error updating password');
                throw new Error('Error updating password');
              }

              // Delete the reset token from the reset_tokens table
              const deleteQuery = 'DELETE FROM tms_reset_tokens WHERE token = ?';
              db.query(deleteQuery, [token], (error, deleteResult) => {
                if (error) {
                  console.error('Error deleting reset token:', error);
                }

                console.log('Password reset successful');
                // Log the end of the function execution with a success message
                logExecution('resetPassword', tenantId, 'INFO', 'Password reset successful');
                res.json({ message: 'Password reset successful' });
              });
            } catch (error) {
              console.error(error);
              // Log the error
              logExecution('resetPassword', tenantId, 'ERROR', 'Internal server error');
              res.status(500).json({ message: 'Internal server error' });
            }
          });
        } catch (error) {
          console.error(error);
          // Log the error
          logExecution('resetPassword', tenantId, 'ERROR', 'Internal server error');
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    } catch (error) {
      console.error(error);
      // Log the error
      logExecution('resetPassword', tenantId, 'ERROR', 'Internal server error');
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}



function setUserOnline(req, res) {
  const UserId = req.params.UserId;
  const userCheckQuery = 'SELECT * FROM tms_users WHERE UserID = ?';

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('setUserOnline', tenantId, 'INFO', 'Setting user online status attempt');

  db.query(userCheckQuery, [UserId], (error, userCheckResult) => {
    try {
      if (error) {
        console.error('Error during device check:', error);
        // Log the error
        logExecution('setUserOnline', tenantId, 'ERROR', 'Error during device check');
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (userCheckResult.length === 0) {
        // Log the end of the function execution with an error message
        logExecution('setUserOnline', tenantId, 'ERROR', 'User not found');
        console.log('User not found!');
        return res.status(400).json({ message: 'User not found!' });
      }

      const onlineQuery = 'UPDATE tms_users SET is_online = ? WHERE UserID = ?';

      db.query(onlineQuery, ['1', UserId], (error, users) => {
        if (error) {
          console.error('Error updating user online status:', error);
          // Log the error
          logExecution('setUserOnline', tenantId, 'ERROR', 'Error updating user online status');
          return res.status(500).json({ message: 'Internal server error' });
        }

        console.log('User online status updated successfully');
        // Log the end of the function execution with a success message
        logExecution('setUserOnline', tenantId, 'INFO', 'User online status updated successfully');
        res.json({ message: 'Status Updated Successfully' });
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      // Log the error
      logExecution('setUserOnline', tenantId, 'ERROR', 'Internal server error');
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}


function setUserOffline(req, res) {
  const UserId = req.params.UserId;

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('setUserOffline', tenantId, 'INFO', 'Setting user offline');

  const userCheckQuery = 'SELECT * FROM tms_users WHERE UserID = ?';

  db.query(userCheckQuery, [UserId], (error, userCheckResult) => {
    try {
      if (error) {
        console.error('Error during device check:', error);
        // Log the error
        logExecution('setUserOffline', tenantId, 'ERROR', 'Error during device check');
        throw new Error('Error during device check');
      }

      if (userCheckResult.length === 0) {
        // Log the end of the function execution with an error message
        logExecution('setUserOffline', tenantId, 'ERROR', 'User not found');
        console.log('User not found!');
        return res.status(400).json({ message: 'Device not found!' });
      }

      const onlineQuery = 'Update tms_users SET is_online = ? WHERE UserID = ?';

      db.query(onlineQuery, ['0', UserId], (error, users) => {
        try {
          if (error) {
            console.error('Error fetching users:', error);
            // Log the error
            logExecution('setUserOffline', tenantId, 'ERROR', 'Error fetching users');
            throw new Error('Error fetching users');
          }

          // Log the end of the function execution with a success message
          logExecution('setUserOffline', tenantId, 'INFO', 'User set offline successfully');
          res.json({ message: 'Status Updated Successfully' });
          console.log(users);
        } catch (error) {
          console.error('Error fetching user:', error);
          // Log the error
          logExecution('setUserOffline', tenantId, 'ERROR', 'Internal server error');
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      // Log the error
      logExecution('setUserOffline', tenantId, 'ERROR', 'Internal server error');
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}


// Helper function to generate a unique 10-digit user ID
function generateUserId() {
  // Log the start of the function execution
  logExecution('generateUserId', tenantId, 'INFO', 'Generating user ID');

  const userIdLength = 10;
  let userId = '';

  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < userIdLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    userId += characters.charAt(randomIndex);
  }

  // Log the end of the function execution with a success message
  logExecution('generateUserId', tenantId, 'INFO', 'User ID generated successfully');

  return userId;
}


function Block(req, res) {
  const { UserId } = req.params;
  const { action } = req.body;

  // Generate a UUID for tenant_id
  const tenantId = uuidv4();

  // Log the start of the function execution
  logExecution('Block', tenantId, 'INFO', `User ${action} attempt`);

  if (action !== 'block' && action !== 'unblock') {
    // Log the end of the function execution with an error message
    logExecution('Block', tenantId, 'ERROR', 'Invalid action');
    return res.status(400).json({ message: 'Invalid action. Use "block" or "unblock".' });
  }

  const blockValue = action === 'block' ? 1 : 0;

  // Check if the user is already blocked or unblocked
  const checkQuery = 'SELECT block FROM tms_users WHERE UserId = ?';

  db.query(checkQuery, [UserId], (checkError, checkResult) => {
    try {
      if (checkError) {
        console.error(`Error checking user block status:`, checkError);
        // Log the error
        logExecution('Block', tenantId, 'ERROR', 'Error checking user block status');
        throw new Error('Error checking user block status');
      }

      if (checkResult.length === 0) {
        // Log the end of the function execution with an error message
        logExecution('Block', tenantId, 'ERROR', 'User not found');
        return res.status(404).json({ message: 'User not found' });
      }

      const currentBlockStatus = checkResult[0].block;

      if (currentBlockStatus === blockValue) {
        const statusMessage = blockValue === 1 ? 'already blocked' : 'already unblocked';
        // Log the end of the function execution with a status message
        logExecution('Block', tenantId, 'INFO', `User is ${statusMessage}`);
        return res.status(200).json({ message: `User is ${statusMessage}` });
      }

      // User is not in the desired block state; update the block status
      const updateQuery = 'UPDATE tms_users SET block = ? WHERE UserId = ?';

      db.query(updateQuery, [blockValue, UserId], (updateError, updateResult) => {
        try {
          if (updateError) {
            console.error(`Error during user ${action}ing:`, updateError);
            // Log the error
            logExecution('Block', tenantId, 'ERROR', `Error ${action}ing user`);
            throw new Error(`Error ${action}ing user`);
          }

          if (updateResult.affectedRows === 0) {
            // Log the end of the function execution with an error message
            logExecution('Block', tenantId, 'ERROR', 'User not found');
            return res.status(404).json({ message: 'User not found' });
          }

          const successMessage = `User ${action}ed successfully`;
          // Log the end of the function execution with a success message
          logExecution('Block', tenantId, 'INFO', successMessage);
          res.status(200).json({ message: successMessage });
        } catch (error) {
          console.error(error);
          // Log the error
          logExecution('Block', tenantId, 'ERROR', 'Internal server error');
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    } catch (error) {
      console.error(error);
      // Log the error
      logExecution('Block', tenantId, 'ERROR', 'Internal server error');
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}




module.exports = {
  register,
  register_dashboard,
  sendTokenEmail,
  sendTokenDashboardEmail,
  sendResetTokenEmail,
  verifyToken,
  resendToken,
  login,
  getUserDetails,
  forgotPassword,
  resendResetToken,
  resetPassword,
  setUserOnline,
  setUserOffline,
  Block
};