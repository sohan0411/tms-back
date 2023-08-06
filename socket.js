const socketIO = require('socket.io');
const mysql = require('mysql');
const dbConfig = require('./db'); 

function Socket(server) {
    const io = socketIO(server);
    const dbConnection = mysql.createPool(dbConfig);

    io.on('connection', (socket) => {
        socket.on('userLoggedIn', (userDetails) => {
            const { userId } = userDetails;
            const updateQuery = `UPDATE tmp.tms_users SET is_online = 1 WHERE id = ?`;
            dbConnection.query(updateQuery, [userId], (err, results) => {
                if (err) {
                    console.error('Error updating online state:', err);
                    return;
                }
                io.emit('userOnline', userDetails);
            });
        });

        socket.on('disconnect', () => {
            const { userId } = users[socket.id];
            const updateQuery = `UPDATE tmp.tms_users SET is_online = 0 WHERE id = ?`;
            dbConnection.query(updateQuery, [userId], (err, results) => {
                if (err) {
                    console.error('Error updating online state:', err);
                    return;
                }
                io.emit('userOffline', userDetails); 
            });

            delete users[socket.id]; 
        });
    });
}

module.exports = Socket;


// const socketIO = require('socket.io');

// function setupSocketServer(server) {
//     const io = socketIO(server);

//     const users = {};

//     io.on('connection', (socket) => {
//         socket.on('userLoggedIn', (userDetails) => {
//             users[socket.id] = userDetails; 
//             io.emit('userOnline', userDetails); 
//         });

//         socket.on('disconnect', () => {
//             const userDetails = users[socket.id];
//             if (userDetails) {
//                 delete users[socket.id]; 
//                 io.emit('userOffline', userDetails);
//             }
//         });
//     });
// }

// module.exports = setupSocketServer;
