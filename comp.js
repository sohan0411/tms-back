const mysql = require('mysql2');

const dbConfig = {
    host: 'senselivedb.cn5vfllmzwrp.ap-south-1.rds.amazonaws.com',
    user: 'admin',
    password: 'sense!123',
    database: 'tmp',
  };

function createPool() {
  const pool = mysql.createPool(dbConfig);
  return pool;
}

function updateCompanyInfo() {
  const getCompanyNamesQuery = 'SELECT DISTINCT CompanyName FROM tms_users';

  try {
    const pool = createPool();
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting a database connection:', err);
        return;
      }

      connection.query(getCompanyNamesQuery, (err, results) => {
        if (err) {
          console.error('Error fetching company names:', err);
          connection.release();
          return;
        }
        const companyNames = results.map((row) => row.CompanyName);
        for (const companyName of companyNames) {
          calculateCompanyStatistics(connection, companyName);
        }

        connection.release();
      });
    });
  } catch (err) {
    console.error('Error updating company info:', err);
  }
}

function calculateCompanyStatistics(connection, companyName) {
    const userCountQuery = 'SELECT COUNT(*) AS total_users FROM tms_users WHERE CompanyName = ?';
    const activeUserCountQuery = 'SELECT COUNT(*) AS active_users FROM tms_users WHERE CompanyName = ? AND is_online = 1';
    const inactiveUserCountQuery = 'SELECT COUNT(*) AS inactive_users FROM tms_users WHERE CompanyName = ? AND is_online = 0';
  
    connection.query(userCountQuery, [companyName], (err, [userCountResult]) => {
      if (err) {
        console.error(`Error calculating total users for ${companyName}:`, err);
        return;
      }
  
      connection.query(activeUserCountQuery, [companyName], (err, [activeUserCountResult]) => {
        if (err) {
          console.error(`Error calculating active users for ${companyName}:`, err);
          return;
        }
  
        connection.query(inactiveUserCountQuery, [companyName], (err, [inactiveUserCountResult]) => {
          if (err) {
            console.error(`Error calculating inactive users for ${companyName}:`, err);
            return;
          }
  
          const totalUsers = userCountResult.total_users;
          const activeUsers = activeUserCountResult.active_users;
          const inactiveUsers = inactiveUserCountResult.inactive_users;
          const insertCompanyDataQuery = 'INSERT INTO company_info (company_name, total_users, active_users, inactive_users) VALUES (?, ?, ?, ?)';
          const deleteCompanyDataQuery = 'DELETE FROM company_info WHERE company_name = ?';
          connection.query(deleteCompanyDataQuery, [companyName], (err) => {
            if (err) {
              console.error(`Error deleting old company data for ${companyName}:`, err);
              return;
            }
            connection.query(insertCompanyDataQuery, [companyName, totalUsers, activeUsers, inactiveUsers], (err) => {
              if (err) {
                console.error(`Error inserting company data for ${companyName}:`, err);
              }
            });
          });
        });
      });
    });
  }
  
updateCompanyInfo();
setInterval(updateCompanyInfo, 10000);
