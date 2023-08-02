const db = require('./db');

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function testData() {
  for (let i = 1; i <= 9; i++) {
    const DeviceUID = `SL0120230${i}`;
    const Temperature = getRandomNumber(35, 50).toFixed(2);
    const Humidity = getRandomNumber(40, 70).toFixed(2);
    const TimeStamp = new Date().toISOString();

    const data = {
      DeviceUID,
      Temperature,
      Humidity,
      TimeStamp
    };

    const entry = "INSERT INTO actual_data SET ?";
    db.query(entry, data, (error, results) => {
      if (error) {
        console.log("Error while inserting data", error);
      } else {
        /*console.log("Data inserted successfully!");*/
      }
    });
  }
}

function testData2() {
  for (let i = 10; i <= 1000; i++) {
    const DeviceUID = `SL012023${i}`;
    const Temperature = getRandomNumber(35, 50).toFixed(2);
    const Humidity = getRandomNumber(40, 70).toFixed(2);
    const TimeStamp = new Date().toISOString();

    const data = {
      DeviceUID,
      Temperature,
      Humidity,
      TimeStamp
    };

    const entry = "INSERT INTO actual_data SET ?";
    db.query(entry, data, (error, results) => {
      if (error) {
        console.log("Error while inserting data", error);
      } else {
        /*console.log("Data inserted successfully!");*/
      }
    });
  }
}

setInterval(testData, 20000);
setInterval(testData2, 20000);


/*
DB_HOST=salasardb1.cl4hxfnr1mxc.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=admin_123
DB_NAME=tmp

*/