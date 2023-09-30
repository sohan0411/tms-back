const db = require('./db'); 

function notiLog() {
  const currentTimestamp = new Date().toISOString();
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const query = `
    SELECT COUNT(*) as requestCount
    FROM info_twi
    WHERE created_time >= ? AND created_time <= ?;
  `;

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return;
    }

    connection.query(query, [fifteenMinutesAgo, currentTimestamp], (error, results) => {
      if (error) {
        console.error('Error querying the database:', error);
        connection.release();
      } else {
        const requestCount = results[0].requestCount;

        const insertQuery = `
          INSERT INTO info_twi_log (timestamp, request_count)
          VALUES (?, ?);
        `;

        connection.query(insertQuery, [currentTimestamp, requestCount], (insertError) => {
          if (insertError) {
            console.error('Error inserting into log_table:', insertError);
          } else {
            console.log('Logged request count successfully:', requestCount);
          }

          connection.release();
        });
      }
    });
  });
}
const interval = 15 * 60 * 1000; 
setInterval(() => {
    notiLog();
}, interval);
