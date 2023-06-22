const bcrypt = require('bcrypt');
const db = require('./db');
const jwtUtils = require('./jwtUtils');
const CircularJSON = require('circular-json');
const secure = require('./secure');

encryptKey = "SenseLive-Tms-Dashboard";

db.query('SET time_zone = "Asia/Kolkata";', (err, results) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Time zone set to Asia/Kolkata');
});


db.query('SELECT @@session.time_zone;', (err, results) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Time zone of current database:', results[0]['@@session.time_zone']);
});

// Registration function
function register(req, res) {
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

  // Check if the company email is already registered
  const emailCheckQuery = 'SELECT * FROM tms_users WHERE CompanyEmail = ?';
  console.log('Email Check Query:', emailCheckQuery);
  db.query(emailCheckQuery, [companyEmail], (error, emailCheckResult) => {
    if (error) {
      console.error('Error during email check:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      if (emailCheckResult.length > 0) {
        console.log('Company email already exists');
        return res.status(400).json({ message: 'Company email already exists' });
      }

      // Check if the username (company email) is already registered
      const usernameCheckQuery = 'SELECT * FROM tms_users WHERE Username = ?';
      console.log('Username Check Query:', usernameCheckQuery);
      db.query(usernameCheckQuery, [companyEmail], (error, usernameCheckResult) => {
        if (error) {
          console.error('Error during username check:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }

        try {
          if (usernameCheckResult.length > 0) {
            console.log('Username already exists');
            return res.status(400).json({ message: 'Username already exists' });
          }

          // Generate a unique 10-digit user ID
          const userId = generateUserId();

          // Hash the password
          bcrypt.hash(password, 10, (error, hashedPassword) => {
            if (error) {
              console.error('Error during password hashing:', error);
              return res.status(500).json({ message: 'Internal server error' });
            }

            try {
              // Insert the user into the database
              const insertQuery =
                'INSERT INTO tms_users (UserId, Username, FirstName, LastName, CompanyName, CompanyEmail, ContactNo, Location, UserType, PersonalEmail, Password, Designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
              console.log('Insert Query:', insertQuery);
              db.query(
                insertQuery,
                [
                  userId,
                  companyEmail,
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
                ],
                (error, insertResult) => {
                  if (error) {
                    console.error('Error during user insertion:', error);
                    return res.status(500).json({ message: 'Internal server error' });
                  }

                  try {
                    // Generate a JWT token
                    const token = jwtUtils.generateToken({ userId: insertResult.insertId });

                    console.log('User registered successfully');
                    res.json({ token });
                  } catch (error) {
                    console.error('Error during JWT token generation:', error);
                    res.status(500).json({ message: 'Internal server error' });
                  }
                }
              );
            } catch (error) {
              console.error('Error during registration:', error);
              res.status(500).json({ message: 'Internal server error' });
            }
          });
        } catch (error) {
          console.error('Error during registration:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}


// Login function
function login(req, res) {
  const { Username, Password } = req.body;

  // Check if the user exists in the database
  const query = 'SELECT * FROM tms_users WHERE Username = ?';
  db.query(query, [Username], (error, rows) => {
    try {
      if (error) {
        throw new Error('Error during login');
      }

      if (rows.length === 0) {
        return res.status(401).json({ message: 'User Does Not exist!' });
      }

      // Compare the provided password with the hashed password in the database
      const user = rows[0];
      bcrypt.compare(Password, user.Password, (error, isPasswordValid) => {
        try {
          if (error) {
            throw new Error('Error during password comparison');
          }

          if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }

          // Generate a JWT token
          const token = jwtUtils.generateToken({ Username: user.Username });
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

  // Verify the token
  const decodedToken = jwtUtils.verifyToken(token);
  if (!decodedToken) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Fetch user details from the database using the decoded token information
  const query = 'SELECT * FROM tms_users WHERE Username = ?';
  db.query(query, [decodedToken.Username], (error, rows) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    res.json(user);
  });
}

function fetchAllUsers(req, res) {
  try {
    const query = 'SELECT * FROM tms_users';
    db.query(query, (error, rows) => {
      if (error) {
        throw new Error('Error fetching users');
      }
      const encryptedUsers = secure.encryptData(rows, encryptKey);

      res.json({ users: encryptedUsers });
      console.log(rows);
      console.log(encryptedUsers)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


// Helper function to generate a unique 10-digit user ID
// Helper function to generate a unique 10-digit user ID
function generateUserId() {
  const userIdLength = 10;
  let userId = '';

  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < userIdLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    userId += characters.charAt(randomIndex);
  }

  return userId;
}


module.exports = { register, login, getUserDetails, fetchAllUsers };
