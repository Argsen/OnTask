/**
 * Created by Harry on 10/01/2017.
 */

var mysql = require('mysql');
const queue = sails.config.globals.queue;

module.exports = {
  connection: function (connectionInfo, tableName, cb) {
    let connection = mysql.createConnection(connectionInfo);

    connection.connect(function (err) {
      if (err) {
      //  console.error('error connecting: ' + err.stack);
        return;
      }
      //  return cb(null, data);
    });

    let obj = {};

    let query = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA= ?";
    if (tableName) {
      query += " && TABLE_NAME= ?";
    }

    connection.query(query, [connectionInfo.database, tableName], function (err, columns) {
      if (err) {
        return cb(err, '');
      } else {
        let length = columns.length;

        if (length > 0) {
          for (var i = 0; i < columns.length; i++) {
            obj[columns[i].TABLE_NAME] = {};
            getTableStructure(connection, columns[i].TABLE_NAME, function (err, tableName, data) {
              length--;
              obj[tableName] = data;
              if (length == 0) {
                connection.end();

                return cb(null, obj);
              }
            });
          }
        } else {
          return cb(null, {})
        }
      }
    });

    //connection.end();
  },

  execute: function (connectionInfo, query, cb) {
    let connection = mysql.createConnection(connectionInfo);

    connection.connect(function (err) {
      if (err) {
        return cb(err);
      }
    });

    connection.query(query, function(err, columns) {
      if (err) {
        return cb(err, null);
      } else {
        return cb(null, columns);
      }
    });

    connection.end();
  },

  queryExecute: function (connectionInfo, query, params) {
    return new Promise((resolve, reject) => {
      connectionInfo.multipleStatements = true;
      let connection = mysql.createConnection(connectionInfo);

      connection.connect(function (err) {
        if (err) {
          reject(err);
        }
      });

      if (params) {
        connection.query(query, params, function(err, columns) {
          if (err) {
            reject(err);
          } else {
            resolve(columns);
          }
        });
      } else {
        connection.query(query, function(err, columns) {
          if (err) {
            reject(err);
          } else {
            resolve(columns);
          }
        });
      }

      connection.end();
    });
  },

  uploadTable: function (workflowId, serverInfo, db, name, data) {
    return new Promise(async (resolve, reject) => {
      try {
        serverInfo.database = db;
        let query = 'CREATE TABLE IF NOT EXISTS ' + name + ' (';
        for (var i=0; i<data.columns.length; i++) {
          data.columns[i] = data.columns[i].replace(/\s/g, "_");
          if (i == data.columns.length - 1) {
            query += data.columns[i] + ' text)';
          } else {
            query += data.columns[i] + ' text,';
          }
        }
        query += ' ENGINE=InnoDB ROW_FORMAT=COMPRESSED;';

        let table = await DBService.queryExecute(serverInfo, query);
        let temp = 0;
        for (var i=0; i<Math.ceil(data.datas.length/1000); i++) {
          query = 'INSERT INTO ' + name + ' (' + data.columns.join(',') + ') VALUES ';

          for (var j=(i*1000); j<(i*1000 + 1000); j++) {
            if (j == data.datas.length) {
              break;
            }
            if (data.datas[j]) {
              if (data.datas[j].length !== data.datas[0].length) {
                if (j==(i*1000 + 1000 - 1) && query[query.length - 1] === ',') {
                  query = query.substring(0, query.length - 1) + ';';
                }
                continue;
              }
              query += '(' + data.datas[j].join(',') + ')';
              if (j==(i*1000 + 1000 - 1) || j == (data.datas.length - 1)) {
                query += ';';
              } else {
                query += ',';
              }
            }
          }

          let result = await DBService.queryExecute(serverInfo, query);
        }
        // uploadDBS({db_name: db, table_name: name}, {db_name: db, table_name: name}, workflowId, function (err, result) {
        //   if (err) {
        //     reject(err);
        //   } else {
        //     resolve(result);
        //   }
        // });
        resolve('done');
      } catch (err) {
        reject(err);
      }
    });
  },

  uploadDBS: function(findObj, createObj, workflowId) {
    return new Promise(async (resolve, reject) => {
      try {
        Dbs.findOrCreate(findObj, createObj).exec(function (err, record) {
          if (err) {
            reject(err)
          } else {
            Workflow_DB.findOrCreate({workflow: workflowId, db: record.id}, {workflow: workflowId, db: record.id, access: "admin"}).exec(function (err, result) {
              if (err) reject(err);
              if (result) {
                resolve(true)
              } else {
                reject(err)
              }
            });
          }
        });
      } catch (err) {
        reject(err)
      }
    });
  },

  transfer: function (workflowId, adminDB, workflowDB, transferObj) {
    return new Promise(async (resolve, reject) => {
      let query = '';

      let workflow = await Workflow.findOne(workflowId);
      if (workflow) {
        if (workflow.transfer) {
          query += 'alter view ' + mysql.escapeId(workflowDB) + '.' + mysql.escapeId('workflow' + workflowId) + ' as select ';
        } else {
          query += 'create view ' + mysql.escapeId(workflowDB) + '.' + mysql.escapeId('workflow' + workflowId) + ' as select ';
        }

        let type = 'inner';
        let selectQuery = '';

        let editQuery = {
          selectQuery: '',
          joinQuery: ''
        };
        if (transferObj.edit) {
            editQuery = await DBService.alterEditMatrix(adminDB, workflowDB, transferObj.mainTable, 'workflow' + workflowId + '_edit', transferObj.columns[0].source.split('.')[1], transferObj);
        }

        for (let i=0; i<transferObj.columns.length; i++) {
          if (transferObj.columns[i].source.indexOf('coalesce') > -1) {
            selectQuery += transferObj.columns[i].source + ' as ' + mysql.escapeId(transferObj.columns[i].target);
          } else {
            selectQuery += mysql.escapeId(transferObj.columns[i].source) + ' as ' + mysql.escapeId(transferObj.columns[i].target);
          }
          if (i < (transferObj.columns.length - 1)) {
            selectQuery += ',';
          }
        }

        query += selectQuery;
        if (editQuery.selectQuery.length > 0) {
          query += ', ' + editQuery.selectQuery
        }
        query += ' from ' + mysql.escapeId(transferObj.mainTable);
        if (transferObj.joinTable.length > 0) {
          for (let i=0; i<transferObj.joinTable.length; i++) {
            for (let j=0; j<transferObj.constraints.length; j++) {
              if (transferObj.joinTable[i] == transferObj.constraints[j].key.split('.')[0] && transferObj.mainTable == transferObj.constraints[j].reference.split('.')[0]) {
                query += ' LEFT JOIN ' + mysql.escapeId(transferObj.joinTable[i]) + ' ON ' + mysql.escapeId(transferObj.constraints[j].key) + ' = ' + mysql.escapeId(transferObj.constraints[j].reference);
              }
            }
          }
        }
        query += editQuery.joinQuery;

        resolve(query);
      } else {
        reject('Invalid workflow ID.');
      }
    });
  },

  alterEditMatrix: function (adminDB, workflowDB, mainTable, editTable, primaryKey, transferObj) {
    return new Promise(async (resolve, reject) => {
      try {
        let selectQuery = '';
        let joinQuery = '';
        let tempArr = [];

        for (let i=0; i<transferObj.edit.columns.length; i++) {
          if (transferObj.edit.columns[i] !== transferObj.edit.primaryKey) {
            tempArr.push(editTable + '.' + transferObj.edit.columns[i] + ' as ' + transferObj.edit.columns[i]);
          } else {
            joinQuery = ' LEFT JOIN ' + workflowDB + '.' + editTable + ' ON ' + adminDB + '.' + mainTable + '.' + primaryKey + ' = ' + workflowDB + '.' + editTable + '.' + transferObj.edit.primaryKey;
          }
        }
        selectQuery = tempArr.join(',');

        resolve({
          selectQuery: selectQuery,
          joinQuery: joinQuery
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  outSource: function (obj, cb) {
    let job = queue.create(sails.config.constant.upload.outSource, obj).save(function (err) {
      if (err) console.log(job.id + ' error');
    });

    job.on('complete', function (result) {
      return cb(null, result);
    }).on('failed attempt', function(errorMessage, doneAttempts){
      console.log(errorMessage);
      console.log('Job failed');
    }).on('failed', function(errorMessage){
      console.log(errorMessage);
      console.log('Job failed');
    }).on('progress', function(progress, data){
      console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data );
    });
  },

  ruleRun: function (obj, cb) {
    let job = queue.create(sails.config.constant.upuload.ruleRun, obj).save(function (err) {
      if (err) console.log(job.id + ' error');
    });

    job.on('complete', function (result) {
      return cb(null, result);
    }).on('failed attempt', function(errorMessage, doneAttempts){
      console.log(errorMessage);
      console.log('Job failed');
    }).on('failed', function(errorMessage){
      console.log(errorMessage);
      console.log('Job failed');
    }).on('progress', function(progress, data){
      console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data );
    });
  }
};

function getTableStructure(connection, tableName, cb) {
  let obj = {};

  connection.query('SHOW COLUMNS FROM ??', [tableName], function (err, columns) {
    obj.columns = columns;
    connection.query('SELECT * FROM ??', [tableName], function (err, data) {
      obj.data = data;

      return cb(null, tableName, obj);
    });
  });
}


function uploadDBS(findObj, createObj, workflowId, cb) {
  Dbs.findOrCreate(findObj, createObj).exec(function (err, record) {
    if (err) {
      cb(err, null);
    } else {
      Workflow_DB.findOrCreate({workflow: workflowId, db: record.id}, {workflow: workflowId, db: record.id, access: "admin"}).exec(function (err, result) {
        if (err) cb(err, null);
        if (result) {
          cb(null, true);
        } else {
          cb(err, null)
        }
      });
    }
  });
}
