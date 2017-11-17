/**
 * Created by Harry on 13/12/2016.
 */

const mysql = require('mysql');
const fs = require('fs');
const parse = require('csv-parse');
const queue = sails.config.globals.queue;

module.exports = {
  connection: function (req, res) {
    let dbInfo = req.param('dbInfo');
    let database = req.param('database');
    let serverInfo = req.param('serverInfo') || sails.config.constant.serverInfo.config;
    let userId = req.param('userId') || req.session.sUserId || 0;
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;

    if (userId !== 0) {
      if (!dbInfo) {
        dbInfo = serverInfo;
        if (!database) {
          dbInfo.database = 'user' + userId;
        } else {
          dbInfo.database = database;
        }
      }

      let temp;
      if (dbInfo.database == 'user' + userId) {
        temp = 'workflow' + workflowId;
      }
      DBService.connection(dbInfo, temp, function (err, data) {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: err
          });
        } else {
          res.json({status: 'success', userId: userId, workflowId: workflowId, data: data});
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid user ID.'
      });
    }
  },

  getStructure: async (req, res) => {
    try {
      const userId = req.session.sUserId || 0;
      const workflowId = req.session.sWorkflowId || 0;
      const serverInfo = sails.config.constant.serverInfo.config;

      if (req.method.toLowerCase() == "get") {
        if (userId !== 0 && workflowId !== 0) {
          let structureObj = {};
          let query;
          const dbs1 = await Workflow_DB.find({workflow: workflowId}).populate('db');
          const dbs2 = await User_DB.find({user: userId}).populate('db');
          let ids = [];
          let dbs = [];

          if (dbs1.length > 0) {
            for (let i=0; i<dbs1.length; i++) {
              if (ids.indexOf(dbs1[i].db.id) < 0) {
                ids.push(dbs1[i].db.id);
                dbs.push(dbs1[i].db);
              }
            }
          }

          if (dbs2.length > 0) {
            for (let i=0; i<dbs2.length; i++) {
              if (ids.indexOf(dbs2[i].db.id) < 0) {
                ids.push(dbs2[i].db.id);
                dbs.push(dbs2[i].db);
              }
            }
          }

          if (dbs.length > 0) {
            for (let i=0; i<dbs.length; i++) {
              query = "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE " +
                "(TABLE_SCHEMA=" + mysql.escape(dbs[i].db_name) + " && TABLE_NAME=" + mysql.escape(dbs[i].table_name) + ")";
              let tempObj = await getStructure(serverInfo, query, structureObj);
            }
          }

          return res.json({
            status: "success",
            data: structureObj,
            userId: userId,
            workflowId: workflowId,
            adminDB: sails.config.constant.serverInfo.adminDB,
            workflowDB: sails.config.constant.serverInfo.workflowDB
          });
        } else {
          return res.badRequest({
            status: "error",
            msg: "Invalid user ID or workflow ID."
          });
        }
      } else {
        return res.badRequest({
          status: "error",
          msg: "Please use Get method."
        });
      }
    } catch (err) {
      res.status(500).send({error: err.code});
    }
  },

  // getStructure: function (req, res) {
  //   let userId = req.param('userId') || req.session.sUserId || 0;
  //   let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;
  //   let serverInfo = sails.config.constant.serverInfo.config;
  //   let admindb = sails.config.constant.serverInfo.adminDB;
  //   let database = req.param('database');
  //
  //   if (userId && workflowId) {
  //     let query;
  //     let obj = {};
  //
  //     obj[admindb] = {};
  //     obj['user' + userId] = {};
  //
  //     if (database == 'user') {
  //       query = "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE " +
  //         "(TABLE_SCHEMA=" + mysql.escape('user' + userId) + " && TABLE_NAME=" + mysql.escape('workflow' + workflowId) + ")";
  //     } else if (database == 'admin') {
  //       query = "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE " +
  //         "(TABLE_SCHEMA=" + mysql.escape(admindb) + " && (TABLE_NAME LIKE " + mysql.escape('ontask\\_workflow' + workflowId + '\\_%') + " || TABLE_NAME NOT LIKE 'ontask\\_workflow%'))";
  //     } else {
  //       query = "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE " +
  //         "(TABLE_SCHEMA=" + mysql.escape(admindb) + " && (TABLE_NAME LIKE " + mysql.escape('ontask\\_workflow' + workflowId + '\\_%') + " || TABLE_NAME NOT LIKE 'ontask\\_workflow%')) " +
  //         "|| (TABLE_SCHEMA=" + mysql.escape('user' + userId) + " && TABLE_NAME=" + mysql.escape('workflow' + workflowId) + ")";
  //     }
  //     getStructure(serverInfo, query, obj, function (err, data) {
  //       if (err) {
  //         return res.badRequest({
  //           status: 'error',
  //           msg: 'Error while processing request.'
  //         });
  //       } else {
  //         return res.json({
  //           status: 'success',
  //           data: data,
  //           userId: userId,
  //           workflowId: workflowId
  //         });
  //       }
  //     });
  //   } else {
  //     return res.badRequest({
  //       status: 'error',
  //       msg: 'Invalid user ID or workflow ID.'
  //     });
  //   }
  // },

  getData: function (req, res) {
    let userId = req.param('userId') || req.session.sUserId || 0;
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;
    let serverInfo = sails.config.constant.serverInfo.config;
    let database = req.param('database');
    let table = req.param('table');

    if (userId !== 0 && workflowId !== 0) {
      let query;

      query = 'SELECT * FROM ' + mysql.escapeId(database) + '.' + mysql.escapeId(table);
      DBService.execute(serverInfo, query, function (err, response) {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: 'Error while processing request.'
          });
        } else {
          return res.json({
            status: 'success',
            data: response
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid user ID or workflow ID.'
      });
    }
  },

  getDataTableData: async (req, res) => {
    try {
      let userId = req.session.sUserId || 0;
      let workflowId = req.session.sWorkflowId || 0;
      let serverInfo = sails.config.constant.serverInfo.config;
      let database = req.param('database');
      let table = req.param('table');
      let columns = req.param('columns');
      let dataTableData = JSON.parse(req.param('dataTableData'));

      if (req.method.toLowerCase() == "get") {
        if (userId !== 0 && workflowId !== 0) {
          const dbs1 = await Workflow_DB.find({workflow: workflowId}).populate('db');
          const dbs2 = await User_DB.find({user: userId}).populate('db');
          const dbs3 = await Dbs.find({db_name: database, table_name: table}).populate('user_dbs');
          const dbs4 = await Dbs.find({db_name: database, table_name: table}).populate('workflow_dbs');
          let exist = false;

          if (dbs1 && dbs1.length > 0) {
            for (let i=0; i<dbs1.length; i++) {
              if (dbs1[i].db.db_name == database && dbs1[i].db.table_name == table) {
                exist = true;
              }
            }
          }
          if (dbs2 && dbs2.length > 0) {
            for (let i=0; i<dbs2.length; i++) {
              if (dbs2[i].db.db_name == database && dbs2[i].db.table_name == table) {
                exist = true;
              }
            }
          }

          if (exist) {
            let query = 'SELECT * FROM ' + mysql.escapeId(database) + '.' + mysql.escapeId(table);
            let countQuery = 'select count(*) from ' + mysql.escapeId(database) + '.' + mysql.escapeId(table);
            let likeQuery = '';

            for (var i=0; i<columns.length; i++) {
              if (dataTableData.search.value !== '') {
                if (i==0) {
                  likeQuery += ' where (';
                }
                likeQuery += mysql.escapeId(columns[i]) + ' like ' + mysql.escape(dataTableData.search.value + '%');
                if (i < (columns.length - 1)) {
                  likeQuery += ' || ';
                } else {
                  likeQuery += ')';
                }
              }
            }
            for (var i=0; i<dataTableData.columns.length; i++) {
              if (dataTableData.columns[i].searchable) {
                if (dataTableData.columns[i].search.value !== '') {
                  if (likeQuery == '') {
                    likeQuery += ' where (' + mysql.escapeId(columns[i]) + ' like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                  } else {
                    likeQuery += ' and (' + mysql.escapeId(columns[i]) + ' like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                  }
                }
              }
            }
            query += likeQuery;
            countQuery += likeQuery;
            query += ' order by ';
            for (var i=0; i<dataTableData.order.length; i++) {
              if (dataTableData.order[i].dir.toLowerCase() == 'desc') {
                query += ' ' + mysql.escapeId(columns[i]) + ' DESC';
              } else if (dataTableData.order[i].dir.toLowerCase() == 'asc') {
                query += ' ' + mysql.escapeId(columns[i]) + ' ASC';
              }
            //  query += ' ' + mysql.escapeId(columns[i]) + ' ' + dataTableData.order[i].dir;
              if (i < (dataTableData.order.length - 1)) {
                query += ',';
              }
            }

            DBService.execute(serverInfo, countQuery, function (err, result) {
              if (err) {
                return res.badRequest({
                  status: 'error',
                  msg: 'Error while processing request.'
                });
              } else {
                var count = 0;
                count = result[0]['count(*)'];
                query += ' limit ' + parseInt(dataTableData.start) + ','+ parseInt(dataTableData.length) + ';';

                DBService.execute(serverInfo, query, function (err, response) {
                  if (err) {
                    return res.badRequest({
                      status: 'error',
                      msg: 'Error while processing request.'
                    });
                  } else {
                    if (response.length > 0) {
                      var arr = [];
                      for (var i=0; i<response.length; i++) {
                        var tempArr = [];
                        for (var key in response[i]) {
                          for (let j=0; j<columns.length; j++) {
                            if (key == columns[j]) {
                              tempArr[j] = response[i][key];
                            }
                          }
                        }
                        arr.push(tempArr);
                      }

                      return res.json({
                        "data": arr,
                        "recordsTotal": count,
                        "recordsFiltered": count
                      });
                    } else {
                      return res.badRequest({
                        status: 'error',
                        msg: 'Data not found.'
                      });
                    }
                  }
                });
              }
            });
          } else {
            return res.badRequest({
              status: "error",
              msg: "Cannot access the data source."
            });
          }
        } else {
          return res.badRequest({
            status: "error",
            msg: "Invalid user ID or workflow ID."
          });
        }
      } else {
        return res.badRequest({
          status: "error",
          msg: "Please use Get method."
        });
      }
    } catch (err) {
      res.status(500).send({error: err.code});
    }
  },

  createDB: function (req, res) {
    let userId = req.param('userId') || req.session.sUserId || 0;
    let serverInfo = req.param('serverInfo');

    if (userId !== 0) {
      let connection = mysql.createConnection({
        host: serverInfo.host,
        user: serverInfo.user,
        password: serverInfo.password
      });

      connection.connect(function (err) {
        if (err) {
          console.error('error connecting: ' + err.stack);
          res.json({status: 'error'});
        }
        //  return cb(null, data);
      });

      connection.query("CREATE DATABASE IF NOT EXISTS " + mysql.escapeId('USER' + userId), function (err) {
        if (err) {
          res.json({status: 'error'});
        } else {
          res.json({status: 'success'});
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid user ID.'
      });
    }
  },

  uploadTable: function (req, res) {
    let userId = req.session.sUserId || 0;
    let workflowId = req.session.sWorkflowId || 0;
    let serverInfo = sails.config.constant.serverInfo.config;
    let name = req.param('name');
    let data = req.param('data');
    let path = req.param('path');
    let unique = req.param('unique');
    let adminDB = sails.config.constant.serverInfo.adminDB;
    let workflowDB = sails.config.constant.serverInfo.workflowDB;

    if (userId !== 0) {
      serverInfo.database = adminDB;
      serverInfo.multipleStatements = true;
      let csvData = [];

      Dbs.findOne({table_name: 'ontask_workflow' + workflowId + '_' + name, db_name: adminDB}).exec(function (err, result) {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: err
          });
        } else {
          if (result) {
            return res.ok({
              status: 'error',
              data: 'Table name already exists, please change upload file name and try again.'
            });
          } else {
            fs.createReadStream(path)
              .pipe(parse({delimiter: ','}))
              .on('data', function (csvrow) {
                for (var i=0; i<csvrow.length; i++) {
                  csvrow[i] = mysql.escape(csvrow[i].replace(/[\\$'"]/g, "\\$&"));
                }
                csvData.push(csvrow);
              })
              .on('end', function () {
                csvData[0] = data;
                for (let i=0; i<csvData[0].length; i++) {
                  csvData[0][i] = mysql.escapeId(csvData[0][i]);
                }
                let query = 'CREATE TABLE IF NOT EXISTS ' + mysql.escapeId('ontask_workflow' + workflowId + '_' + name) + ' (';
                for (var i=0; i<csvData[0].length; i++) {
                  let a = '';
                  if (unique && unique.indexOf(csvData[0][i]) > -1) {
                    a = 'unique';
                  }
                  csvData[0][i] = csvData[0][i].replace(/\s/g, "_");
                  if (i == csvData[0].length - 1) {
                    query += csvData[0][i] + ' text ' + a + ')';
                  } else {
                    query += csvData[0][i] + ' text ' + a + ',';
                  }
                }

                query += ' ENGINE=InnoDB ROW_FORMAT=COMPRESSED;';
                DBService.execute(serverInfo, query, function (err, data) {
                  if (err) {
                    return res.badRequest({
                      status: 'error',
                      msg: err
                    });
                  } else {
                    let temp = 0;
                    for (var i=0; i<Math.ceil(csvData.length/1000); i++) {
                      query = 'INSERT INTO ' + mysql.escapeId('ontask_workflow' + workflowId + '_' + name) + ' (' + csvData[0].join(',') + ') VALUES ';

                      for (var j=(i*1000+1); j<(i*1000 + 1000 + 1); j++) {
                        if (j == csvData.length) {
                          break;
                        }
                        if (csvData[j]) {
                          if (csvData[j].length !== csvData[0].length) {
                            if (j==(i*1000 + 1000) && query[query.length - 1] === ',') {
                              query = query.substring(0, query.length - 1) + ';';
                            }
                            continue;
                          }
                          query += '(' + csvData[j].join(',') + ')';
                          if (j==(i*1000 + 1000) || j == (csvData.length - 1)) {
                            query += ';';
                          } else {
                            query += ',';
                          }
                        }
                      }

                      let job = queue.create(sails.config.constant.upload.table, {query: query, connectionInfo: serverInfo}).save(function (err) {
                        if (err) console.log(job.id + ' error');
                      });

                      job.on('complete', function (result) {
                      //  return cb(null, result);
                        temp++;
                        if (temp == Math.ceil(csvData.length / 1000)) {
                          uploadDBS({db_name: adminDB, table_name: 'ontask_workflow' + workflowId + '_' + name}, {db_name: adminDB, table_name: 'ontask_workflow' + workflowId + '_' + name}, workflowId, function (err, result) {
                            if (err) {
                              return res.badRequest({
                                status: 'error',
                                msg: err
                              });
                            } else {
                              return res.ok({
                                status: 'success'
                              });
                            }
                          });
                        }
                      }).on('failed attempt', function(errorMessage, doneAttempts){
                        console.log('Job failed');
                      }).on('failed', function(errorMessage){
                        temp++;
                        console.log('Job failed');
                        if (temp == Math.ceil(csvData.length / 1000)) {
                          uploadDBS({db_name: adminDB, table_name: 'ontask_workflow' + workflowId + '_' + name}, {db_name: adminDB, table_name: 'ontask_workflow' + workflowId + '_' + name}, workflowId, function (err, result) {
                            if (err) {
                              return res.badRequest({
                                status: 'error',
                                msg: err
                              });
                            } else {
                              return res.ok({
                                status: 'success'
                              });
                            }
                          });
                        }
                      }).on('progress', function(progress, data){
                        console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data );
                      });
                    }
                  }
                });
              });
          }
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid user ID.'
      });
    }
  },

  convert: function (req, res) {
    let userId = req.param('userId') || req.session.sUserId || 0;
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;
    let serverInfo = sails.config.constant.serverInfo.config;
    let originalColumnName = req.param('originalColumnName');
    let data = req.param('data');
    let transferObj = JSON.parse(req.param('transferObj'));

    if (userId !== 0 && workflowId !== 0) {
      let tableName = 'workflow' + mysql.escape(workflowId);
      serverInfo.database = sails.config.constant.serverInfo.adminDB;
      serverInfo.multipleStatements = true;
      let query = '';

      for (var i=0; i<transferObj.columns.length; i++) {
        if (transferObj.columns[i].target == originalColumnName) {
          query = 'ALTER TABLE ' + mysql.escapeId(transferObj.columns[i].source.split('.')[0]) + ' MODIFY COLUMN ' + mysql.escapeId(transferObj.columns[i].source.split('.')[1]) + ' ' + data.Type.replace(/[^a-zA-Z()0-9]/g, "") + ' ' + data.Null.replace(/[^a-zA-Z()0-9]/g, "") + ' ' + data.Key.replace(/[^a-zA-Z()0-9]/g, "") + ' ' + data.Default.replace(/[^a-zA-Z()0-9]/g, "") + ' ' + data.Extra.replace(/[^a-zA-Z()0-9]/g, "") + ';';
        }
      }

      DBService.execute(serverInfo, query, function (err, data) {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: err
          });
        } else {
          res.json({status: 'success', data: data});
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid user or workflow ID.'
      });
    }
  },

  transfer: function (req, res) {
    let userId = req.session.sUserId || 0;
    let workflowId = req.session.sWorkflowId || 0;
    let serverInfo = sails.config.constant.serverInfo.config;
    let transferObj = JSON.parse(req.param('transferObj'));
    let adminDB = sails.config.constant.serverInfo.adminDB;
    let workflowDB = sails.config.constant.serverInfo.workflowDB;

    if (userId != 0 && workflowId != 0) {
      serverInfo.database = adminDB;
      serverInfo.multipleStatements = true;
      let viewName = 'workflow' + workflowId;
      let query = '';

      Workflow.findOne(workflowId).exec(async (err, workflow) => {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: err
          });
        } else {
          if (workflow) {
            if (workflow.transfer && workflow.transfer.length > 0) {
              query += 'alter view ' + mysql.escapeId(workflowDB) + '.' + mysql.escapeId(viewName) + ' as select ';
            } else {
              query += 'create view ' + mysql.escapeId(workflowDB) + '.' + mysql.escapeId(viewName) + ' as select ';
            }

            let type = 'inner';
            let selectQuery = '';
            for (var i=0; i<transferObj.constraints.length; i++) {
              if (transferObj.constraints[i].type == 'outer') {
                type = 'outer';
              }
            }

            let editQuery;
            if (transferObj.edit) {
              try {
                editQuery = await DBService.alterEditMatrix(adminDB, workflowDB, transferObj.mainTable, 'workflow' + workflowId + '_edit', transferObj.columns[0].source.split('.')[1], transferObj);
              } catch (err) {
                editQuery = {
                  selectQuery: '',
                  joinQuery: ''
                }
              }
            } else {
              editQuery = {
                selectQuery: '',
                joinQuery: ''
              }
            }

            for (var i=0; i<transferObj.columns.length; i++) {
              if (transferObj.columns[i].source.indexOf('coalesce') > -1) {
                selectQuery += transferObj.columns[i].source + ' as ' + mysql.escapeId(transferObj.columns[i].target);
              } else {
                selectQuery += mysql.escapeId(transferObj.columns[i].source) + ' as ' + mysql.escapeId(transferObj.columns[i].target);
              }
              if (i < (transferObj.columns.length - 1)) {
                selectQuery += ', ';
              }
            }

            query += selectQuery;
            if (editQuery.selectQuery.length > 0) {
              query += ', ' + editQuery.selectQuery
            }
            query += ' from ' + mysql.escapeId(transferObj.mainTable);
            if (transferObj.joinTable.length > 0) {
              for (var i=0; i<transferObj.joinTable.length; i++) {
                for (var j=0; j<transferObj.constraints.length; j++) {
                  if (transferObj.joinTable[i] == transferObj.constraints[j].key.split('.')[0] && transferObj.mainTable == transferObj.constraints[j].reference.split('.')[0]) {
                    query += ' LEFT JOIN ' + mysql.escapeId(transferObj.joinTable[i]) + ' ON ' + mysql.escapeId(transferObj.constraints[j].key) + ' = ' + mysql.escapeId(transferObj.constraints[j].reference);
                  }
                }
              }
            }
            query += editQuery.joinQuery;

            if (type == 'outer') {
              query += ' union select ';
              query += selectQuery;
              query += ' from ' + mysql.escapeId(transferObj.mainTable);
              if (transferObj.joinTable.length > 0) {
                for (var i=0; i<transferObj.joinTable.length; i++) {
                  for (var j=0; j<transferObj.constraints.length; j++) {
                    if (transferObj.joinTable[i] == transferObj.constraints[j].key.split('.')[0] && transferObj.mainTable == transferObj.constraints[j].reference.split('.')[0]) {
                      if (transferObj.constraints[j].type == 'outer') {
                        query += ' RIGHT JOIN ' + mysql.escapeId(transferObj.joinTable[i]) + ' ON ' + mysql.escapeId(transferObj.constraints[j].key) + ' = ' + mysql.escapeId(transferObj.constraints[j].reference);
                      } else {
                        query += ' LEFT JOIN ' + mysql.escapeId(transferObj.joinTable[i]) + ' ON ' + mysql.escapeId(transferObj.constraints[j].key) + ' = ' + mysql.escapeId(transferObj.constraints[j].reference);
                      }
                    }
                  }
                }
              }
            }

            DBService.execute(serverInfo, query, function (err, data) {
              if (err) {
                return res.badRequest({
                  status: 'error',
                  msg: err
                });
              } else {
                Workflow.update(workflowId, {transfer: JSON.stringify(transferObj)}).exec(function (err, data) {
                  if (err) {
                    return res.badRequest({
                      status: 'error',
                      msg: err
                    });
                  } else {
                    uploadDBS({db_name: workflowDB, table_name: viewName}, {db_name: workflowDB, table_name: viewName}, workflowId, function (err, result) {
                      if (err) {
                        return res.badRequest({
                          status: 'error',
                          msg: err
                        });
                      } else {
                        res.json({status: 'success'});
                      }
                    });
                  }
                });
              }
            });
          } else {

          }
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid user or workflow ID.'
      });
    }
  }

  // transfer: function (req, res) {
  //   let userId = req.param('userId') || req.session.sUserId || 0;
  //   let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;
  //   let serverInfo = sails.config.constant.serverInfo.config;
  //   let transferObj = JSON.parse(req.param('transferObj'));
  //   let dbName = req.param('dbName') || sails.config.constant.serverInfo.adminDB;
  //
  //   if (userId != 0 && workflowId != 0) {
  //     serverInfo.database = dbName;
  //     serverInfo.multipleStatements = true;
  //     let viewName = 'workflow' + workflowId;
  //     let query = '';
  //
  //     Workflow.findOne(workflowId).exec(function (err, workflow) {
  //       if (err) {
  //         return res.badRequest({
  //           status: 'error',
  //           msg: err
  //         });
  //       } else {
  //         if (workflow) {
  //           if (workflow.transfer && workflow.transfer.length > 0) {
  //             query += 'alter view ' + mysql.escapeId('user' + userId) + '.' + mysql.escapeId(viewName) + ' as select ';
  //           } else {
  //             query += 'create view ' + mysql.escapeId('user' + userId) + '.' + mysql.escapeId(viewName) + ' as select ';
  //           }
  //
  //           let type = 'inner';
  //           let selectQuery = '';
  //           for (var i=0; i<transferObj.constraints.length; i++) {
  //             if (transferObj.constraints[i].type == 'outer') {
  //               type = 'outer';
  //             }
  //           }
  //
  //           for (var i=0; i<transferObj.columns.length; i++) {
  //             if (transferObj.columns[i].source.indexOf('coalesce') > -1) {
  //               selectQuery += transferObj.columns[i].source + ' as ' + mysql.escapeId(transferObj.columns[i].target);
  //             } else {
  //               selectQuery += mysql.escapeId(transferObj.columns[i].source) + ' as ' + mysql.escapeId(transferObj.columns[i].target);
  //             }
  //             if (i < (transferObj.columns.length - 1)) {
  //               selectQuery += ', ';
  //             }
  //           }
  //
  //           query += selectQuery;
  //           query += ' from ' + mysql.escapeId(transferObj.mainTable);
  //           if (transferObj.joinTable.length > 0) {
  //             for (var i=0; i<transferObj.joinTable.length; i++) {
  //               for (var j=0; j<transferObj.constraints.length; j++) {
  //                 if (transferObj.joinTable[i] == transferObj.constraints[j].key.split('.')[0] && transferObj.mainTable == transferObj.constraints[j].reference.split('.')[0]) {
  //                   query += ' LEFT JOIN ' + mysql.escapeId(transferObj.joinTable[i]) + ' ON ' + mysql.escapeId(transferObj.constraints[j].key) + ' = ' + mysql.escapeId(transferObj.constraints[j].reference);
  //                 }
  //               }
  //             }
  //           }
  //
  //           if (type == 'outer') {
  //             query += ' union select ';
  //             query += selectQuery;
  //             query += ' from ' + mysql.escapeId(transferObj.mainTable);
  //             if (transferObj.joinTable.length > 0) {
  //               for (var i=0; i<transferObj.joinTable.length; i++) {
  //                 for (var j=0; j<transferObj.constraints.length; j++) {
  //                   if (transferObj.joinTable[i] == transferObj.constraints[j].key.split('.')[0] && transferObj.mainTable == transferObj.constraints[j].reference.split('.')[0]) {
  //                     if (transferObj.constraints[j].type == 'outer') {
  //                       query += ' RIGHT JOIN ' + mysql.escapeId(transferObj.joinTable[i]) + ' ON ' + mysql.escapeId(transferObj.constraints[j].key) + ' = ' + mysql.escapeId(transferObj.constraints[j].reference);
  //                     } else {
  //                       query += ' LEFT JOIN ' + mysql.escapeId(transferObj.joinTable[i]) + ' ON ' + mysql.escapeId(transferObj.constraints[j].key) + ' = ' + mysql.escapeId(transferObj.constraints[j].reference);
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //
  //           DBService.execute(serverInfo, query, function (err, data) {
  //             if (err) {
  //               return res.badRequest({
  //                 status: 'error',
  //                 msg: err
  //               });
  //             } else {
  //
  //               //let tableQuery = 'drop table workflow' + mysql.escape(workflowId);
  //               //tableQuery += 'create table'
  //
  //               Workflow.update(workflowId, {transfer: JSON.stringify(transferObj)}).exec(function (err, data) {
  //                 if (err) {
  //                   return res.badRequest({
  //                     status: 'error',
  //                     msg: err
  //                   });
  //                 } else {
  //                   res.json({status: 'success'});
  //                 }
  //               });
  //             }
  //           });
  //         } else {
  //
  //         }
  //       }
  //     });
  //   } else {
  //     return res.badRequest({
  //       status: 'error',
  //       msg: 'Invalid user or workflow ID.'
  //     });
  //   }
  // }
}

function getStructure(serverInfo, query, obj) {
  return new Promise((resolve, reject) => {
    DBService.execute(serverInfo, query, function (err, data) {
      if (err) {
        reject(err);
      } else {
        let length = data.length;

        if (data.length > 0) {
          for (var i=0; i<data.length; i++) {
            if (!obj.hasOwnProperty(data[i].TABLE_SCHEMA)) {
              obj[data[i].TABLE_SCHEMA] = {};
              obj[data[i].TABLE_SCHEMA][data[i].TABLE_NAME] = {};
            } else {
              if (!obj[data[i].TABLE_SCHEMA][data[i].TABLE_NAME]) {
                obj[data[i].TABLE_SCHEMA][data[i].TABLE_NAME] = {};
              }
            }
            let subQuery = 'SHOW COLUMNS FROM ' + mysql.escapeId(data[i].TABLE_SCHEMA) + '.' + mysql.escapeId(data[i].TABLE_NAME);
            getTableStructure(serverInfo, data[i].TABLE_SCHEMA, data[i].TABLE_NAME, subQuery, function (err, response) {
             if (err) {
               reject(err);
             } else {
               length--;
               obj[response.database][response.table].columns = response.columns;
               if (length == 0) {
                 resolve(obj);
               }
             }
            });
          }
        } else {
          reject('empty schema');
        }
      }
    });
  });
}

// function getStructure(serverInfo, query, obj, cb) {
//   DBService.execute(serverInfo, query, function (err, data) {
//     if (err) {
//       return cb(err, null);
//     } else {
//       let length = data.length;
//
//       if (data.length > 0) {
//         for (var i=0; i<data.length; i++) {
//           if (!obj.hasOwnProperty(data[i].TABLE_SCHEMA)) {
//             obj[data[i].TABLE_SCHEMA] = {};
//             obj[data[i].TABLE_SCHEMA][data[i].TABLE_NAME] = {};
//           } else {
//             if (!obj[data[i].TABLE_SCHEMA][data[i].TABLE_NAME]) {
//               obj[data[i].TABLE_SCHEMA][data[i].TABLE_NAME] = {};
//             }
//           }
//           let subQuery = 'SHOW COLUMNS FROM ' + mysql.escapeId(data[i].TABLE_SCHEMA) + '.' + mysql.escapeId(data[i].TABLE_NAME);
//           getTableStructure(serverInfo, data[i].TABLE_SCHEMA, data[i].TABLE_NAME, subQuery, function (err, response) {
//            if (err) {
//              return cb(err, null);
//            } else {
//              length--;
//              obj[response.database][response.table].columns = response.columns;
//              if (length == 0) {
//                return cb(null, obj);
//              }
//            }
//           });
//         }
//       } else {
//         return cb('empty schema', null);
//       }
//     }
//   });
// }

function getTableStructure(serverInfo, db, table, query, cb) {
  DBService.execute(serverInfo, query, function (err, columns) {
    if (err) {
      return cb(err, null);
    } else {
      return cb(null, {database: db, table: table, columns: columns});
    }
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
