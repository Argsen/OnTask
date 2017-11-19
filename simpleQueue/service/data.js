/**
 * Created by Harry on 5/06/2017.
 */

const mysql = require('mysql');
const Sequelize = require('sequelize');
const settings = require('./../config/settings');

const data = {
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
  },

  outSource: async (job, cb) => {
    try {
      const sequelize = new Sequelize(job.data.database, job.data.user, job.data.password, {
        host: job.data.host,
        dialect: job.data.dialect,
        port: job.data.port
      });

      sequelize
        .authenticate()
        .then(() => {
          sequelize.query('select * from ' + job.data.table, {type: sequelize.QueryTypes.SELECT}).then((data, metadata) => {
            let connection = mysql.createConnection(settings.adminDB);
            connection.connect(function (err) {
              if (err) {
                return;
              }
            });

            let query = 'drop table if exists ontask_workflow' + job.data.workflowId + '_' + job.data.table + '; create table if not exists ontask_workflow' + job.data.workflowId + '_' + job.data.table + ' (';
            let columns = [];
            for (let key in data[0]) {
              columns.push(key);
            }
            var dataArr = data.map(function (el) {
              let tempArr = [];
              for (let i=0; i<columns.length; i++) {
                tempArr.push(el[columns[i]])
              }
              return tempArr;
            });
            query += columns.join(' text, ') + ' text) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;';
            connection.query(query, function(err, results, fields) {
              if (err) {
                return cb(err, null);
              } else {
                connection.query('insert into ontask_workflow' + job.data.workflowId + '_' + job.data.table + ' (' + columns.join(',') + ') values ?', [dataArr], function (err, results, fields) {
                  if (err) {
                    return cb(err, null);
                  } else {
                    return cb(null, results);
                  }
                });
              }
            });
          });
        })
        .catch(err => {
          console.error('Unable to connect to the database:', err);
        });
    } catch (err) {
      console.log(err);
      cb(err, null);
    }
  }
};

module.exports = data;
