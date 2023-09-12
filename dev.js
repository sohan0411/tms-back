const db = require('./db');

function userInfo() {
  let totalUsers, activeUsers, inactiveUsers; // Define variables in the outermost scope

  const userCountQuery = 'SELECT COUNT(*) as total_users FROM tms_users';
  const activeUserCountQuery = 'SELECT COUNT(*) as active_users FROM tms_users WHERE is_online = 1';
  const inactiveUserCountQuery = 'SELECT COUNT(*) as inactive_users FROM tms_users WHERE is_online = 0';

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }

    // Start a transaction to ensure data consistency
    connection.beginTransaction((err) => {
      if (err) {
        console.error('Error starting Inserted:', err);
        connection.release();
        return;
      }

      // Delete old data from user_info table
      const deleteStatisticsQuery = 'DELETE FROM user_info';
      connection.query(deleteStatisticsQuery, (err) => {
        if (err) {
          console.error('Error deleting old user statistics:', err);
          connection.rollback(() => {
            console.error('Inserted rolled back.');
            connection.release();
          });
          return;
        }

        connection.query(userCountQuery, (err, userCountResult) => {
          if (err) {
            console.error('Error calculating total users:', err);
            connection.rollback(() => {
              console.error('Inserted rolled back.');
              connection.release();
            });
            return;
          }

          // Assign values to the variables
          totalUsers = userCountResult[0].total_users;

          connection.query(activeUserCountQuery, (err, activeUserCountResult) => {
            if (err) {
              console.error('Error calculating active users:', err);
              connection.rollback(() => {
                console.error('Inserted rolled back.');
                connection.release();
              });
              return;
            }

            // Assign values to the variables
            activeUsers = activeUserCountResult[0].active_users;

            connection.query(inactiveUserCountQuery, (err, inactiveUserCountResult) => {
              if (err) {
                console.error('Error calculating inactive users:', err);
                connection.rollback(() => {
                  console.error('Inserted rolled back.');
                  connection.release();
                });
                return;
              }

              // Assign values to the variables
              inactiveUsers = inactiveUserCountResult[0].inactive_users;

              // Insert the calculated statistics into the user_info table
              const insertStatisticsQuery = 'INSERT INTO user_info (all_users, active_users, inactive_users) VALUES (?, ?, ?)';
              connection.query(insertStatisticsQuery, [totalUsers, activeUsers, inactiveUsers], (err) => {
                if (err) {
                  console.error('Error inserting user statistics:', err);
                  connection.rollback(() => {
                    console.error('Inserted rolled back.');
                    connection.release();
                  });
                } else {
                  connection.commit((err) => {
                    if (err) {
                      console.error('Error committing Inserted:', err);
                      connection.rollback(() => {
                        console.error('Inserted rolled back.');
                        connection.release();
                      });
                    } else {
                      console.log('Inserted successfully.');
                      connection.release();
                    }
                  });
                }
              });
            });
          });
        });
      });
    });
  });
}

setInterval(userInfo, 10000);