/**
 * Created by Harry on 5/06/2017.
 */

const mysql = require('mysql');

const file = {
  query: function (job, cb) {
    let connection = mysql.createConnection(job.data.connectionInfo);

    connection.connect(function (err) {
      if (err) {
        return cb(err);
      }
    });

    connection.query(job.data.query, function(err, columns) {
      if (err) {
        return cb(err, null);
      } else {
        return cb(null, columns);
      }
    });

    connection.end();
  }
};

module.exports = file;