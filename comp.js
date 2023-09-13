const db = require('./db');

function updateCompanyInfo() {
    const getCompanyNamesQuery = 'SELECT DISTINCT CompanyName FROM tms_users';

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return;
        }

        connection.query(getCompanyNamesQuery, (err, results) => {
            if (err) {
                console.error('Error fetching company names:', err);
                connection.release();
                return;
            }

            results.forEach((row) => {
                const companyName = row.CompanyName;

                // Calculate total users, active users, and inactive users for each company
                calculateCompanyStatistics(connection, companyName);
            });
        });
    });
}

function calculateCompanyStatistics(connection, companyName) {
    const userCountQuery = 'SELECT COUNT(*) AS total_users FROM tms_users WHERE CompanyName = ?';
    const activeUserCountQuery = 'SELECT COUNT(*) AS active_users FROM tms_users WHERE CompanyName = ? AND is_online = 1';
    const inactiveUserCountQuery = 'SELECT COUNT(*) AS inactive_users FROM tms_users WHERE CompanyName = ? AND is_online = 0';

    connection.query(userCountQuery, [companyName], (err, userCountResult) => {
        if (err) {
            console.error(`Error calculating total users for ${companyName}:`, err);
            return;
        }

        connection.query(activeUserCountQuery, [companyName], (err, activeUserCountResult) => {
            if (err) {
                console.error(`Error calculating active users for ${companyName}:`, err);
                return;
            }

            connection.query(inactiveUserCountQuery, [companyName], (err, inactiveUserCountResult) => {
                if (err) {
                    console.error(`Error calculating inactive users for ${companyName}:`, err);
                    return;
                }

                const totalUsers = userCountResult[0].total_users;
                const activeUsers = activeUserCountResult[0].active_users;
                const inactiveUsers = inactiveUserCountResult[0].inactive_users;

                // Insert the calculated statistics into the company_info table
                const insertCompanyDataQuery = 'INSERT INTO company_info (company_name, total_users, active_users, inactive_users) VALUES (?, ?, ?, ?)';

                connection.query(insertCompanyDataQuery, [companyName, totalUsers, activeUsers, inactiveUsers], (err) => {
                    if (err) {
                        console.error(`Error inserting company data for ${companyName}:`, err);
                    } else {
                        //console.log(`Company data for ${companyName} inserted successfully.`);
                    }
                });
            });
        });
    });
}

// Call the updateCompanyInfo function to start the process
updateCompanyInfo();
setInterval(updateCompanyInfo, 10000);
