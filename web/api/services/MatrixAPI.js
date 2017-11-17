const DBService = require('./DBService');

module.exports = {
  // Retrieve workflow matrix's columns and data
  getData: function (workflowId, serverInfo, adminDB, workflowDB) {
    return new Promise(async (resolve, reject) => {
      try {
        let columnsQuery = 'SHOW COLUMNS FROM ' + workflowDB + '.workflow' + workflowId;
        let datasQuery = 'SELECT * FROM ' + workflowDB + '.workflow' + workflowId;

        const columns = await DBService.queryExecute(serverInfo, columnsQuery);
        const datas = await DBService.queryExecute(serverInfo, datasQuery);

        resolve({columns: columns, datas: datas});
      } catch (err) {
        reject(err);
      }
    });
  },

  // create: function (workflowId, connectionInfo, columns, datas) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       if (workflowId !== 0) {
  //         const workflow = await Workflow.findOne(workflowId);
          
  //         if (!workflow.transfer) {
  //           let primaryKey;

  //           for (let i=0; i<columns.length; i++) {
  //             if (columns[i].dataType.toLowerCase().indexOf('primary key') > -1) {
  //               primaryKey = columns[i].name;
  //             }
  //           }

  //           if (primaryKey) {
  //             const workflowTable = 'workflow' + workflowId;
  //             const workflowEditTable = 'workflow' + workflowId + '_edit';
  //             let createQuery = 'CREATE TABLE IF NOT EXISTS ' + workflowEditTable + ' (';
  //             let tempArr1 = [];
  //             let tempArr2
    
  //             for (let i=0; i<columns.length; i++) {
  //               let str = '`' + columns[i].name + '` ';
  //               if (columns[i].dataType) {
  //                 str += columns[i].dataType;
  //               } else {
  //                 str += 'text null ';
  //               }
  //               tempArr1.push(str);
  //               tempArr2.push(columns[i].name);
  //             }
              
  //             createQuery += tempArr1.join(',') + ') ENGINE=InnoDB ROW_FORMAT=COMPRESSED;';
  //             const createResult = await DBService.queryExecute(connectionInfo, createQuery);

  //             for (let i=0; i<Math.ceil(datas.length/1000); i++) {
  //               let insertQuery = 'INSERT INTO ' + workflowEditTable + ' (' + tempArr[2].join(',') + ') VALUES ';
  //               for (let j=(i*1000); j<(i*1000 + 1000); j++) {
  //                 if (j == datas.length) {
  //                   break;
  //                 }
  //               }
  //               const insertResult = await DBService.queryExecute(connectionInfo, insertQuery);
  //             }
    
  //           } else {
  //             reject('Please specific primary key.');
  //           }
  //         } else {
  //           reject('Matrix already exists, please use add or update function.');
  //         }
  //       } else {
  //         reject('Need provide workflow ID.');
  //       }
  //     } catch (err) {
  //       reject(err);
  //     }
  //   });
  // },

  // If edit table not exists, create edit table
  // update the primary key column in edit table the same as workflow table
  updatePK: function (workflowId, serverInfo, adminDB, workflowDB, transferObj) {
    return new Promise(async (resolve, reject) => {
      try {
        const workflowTable = 'workflow' + workflowId;
        const workflowEditTable = 'workflow' + workflowId + '_edit';
        let exists = false;

        let primaryKey = transferObj.columns[0].target;

        if (!transferObj.edit) {
          transferObj.edit = {};
          transferObj.edit.primaryKey = primaryKey;
          transferObj.edit.columns = [primaryKey];

          let query = 'create table if not exists ' + workflowDB + '.' + workflowEditTable + ' (`id` int(11) NOT NULL AUTO_INCREMENT, `' + primaryKey + '` text NOT NULL, PRIMARY KEY (`id`))  ENGINE=InnoDB ROW_FORMAT=COMPRESSED;';
          const result = await DBService.queryExecute(serverInfo, query);
        }

        let query = 'insert into ' + workflowDB + '.' + workflowEditTable + ' (' + primaryKey + ') select ' + workflowDB + '.' + workflowTable + '.' + primaryKey + ' from ' + workflowDB + '.' + workflowTable + ' where ' + workflowDB + '.' + workflowTable + '.' + primaryKey + ' not in (select ' + workflowDB + '.' + workflowEditTable + '.' + primaryKey + ' from ' + workflowDB + '.' + workflowEditTable + ')';

        const result = await DBService.queryExecute(serverInfo, query);
        const newWorkflow = await Workflow.update(workflowId, {transfer: JSON.stringify(transferObj)});

        resolve(primaryKey);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },

  addColumn: function (workflowId, serverInfo, adminDB, workflowDB, columns, datas, key) {
    return new Promise(async (resolve, reject) => {
      try {
        const workflowTable = 'workflow' + workflowId;
        const workflowEditTable = 'workflow' + workflowId + '_edit';

        let dataQuery = '';
        let tempArr = [];
        
        for (let i=0; i<columns.length; i++) {
          let query = 'select null from information_schema.columns where column_name = "' + columns[i] + '" and table_name = "' + workflowEditTable + '" and table_schema = "' + workflowDB + '"';
          // check if column exists
          const columnSearchResult = await DBService.queryExecute(serverInfo, query);
          if (columnSearchResult.length < 1) {
            tempArr.push(columns[i] + ' text null');
          }
        }

        // add column
        if (tempArr.length > 0) {
          const alterResult = await DBService.queryExecute(serverInfo, 'alter table ' + workflowDB + '.' + workflowEditTable + ' add column (' + tempArr.join(',') + ')');
        }

        for (let i=0; i<Math.ceil(datas.length/1000); i++) {
          dataQuery = '';
          for (let j=(i*1000); j<(i*1000 + 1000); j++) {
            if (j == datas.length) {
              break;
            }
            
            dataQuery += 'update ' + workflowDB + '.' + workflowEditTable + ' set ';
            let tempArr1 = [];
            for (let k=0; k<columns.length; k++) {
              if (columns[k] !== key) {
                tempArr1.push(columns[k] + '=' + datas[j][columns[k]]);
              }
            }
            dataQuery += tempArr1.join(',');
            dataQuery += ' where ' + key + '=' + datas[j][key] + ';'
          }
          serverInfo.database = workflowDB;
          const updateResult = await DBService.queryExecute(serverInfo, dataQuery);
        }

        const workflow = await Workflow.findOne(workflowId);
        let transferObj = JSON.parse(workflow.transfer);
        for (let i=0; i<columns.length; i++) {
          if (transferObj.edit.columns.indexOf(columns[i]) < 0) {
            transferObj.edit.columns.push(columns[i]);
          }
        }

        const transferQuery = await DBService.transfer(workflowId, adminDB, workflowDB, transferObj);
        serverInfo.database = adminDB;
        const transferResult = await DBService.queryExecute(serverInfo, transferQuery);
        const updateWorkflow = await Workflow.update(workflowId, {transfer: JSON.stringify(transferObj)});

        resolve('success');
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },

  updateColumn: function (workflowId, serverInfo, adminDB, workflowDB, columns, datas, key) {
    return new Promise(async (resolve, reject) => {
      try {
        const workflowEditTable = 'workflow' + workflowId + '_edit';

        let dataQuery = '';

        for (let i=0; i<Math.ceil(datas.length/1000); i++) {
          dataQuery = '';
          for (let j=(i*1000); j<(i*1000 + 1000); j++) {
            if (j == datas.length) {
              break;
            }
            
            dataQuery += 'update ' + workflowDB + '.' + workflowEditTable + ' set ';
            let tempArr1 = [];
            for (let k=0; k<columns.length; k++) {
              if (columns[k] !== key) {
                tempArr1.push(columns[k] + '=' + datas[j][columns[k]]);
              }
            }
            dataQuery += tempArr1.join(',');
            dataQuery += ' where ' + key + '=' + datas[j][key] + ';'
          }
          serverInfo.database = workflowDB;
          const updateResult = await DBService.queryExecute(serverInfo, dataQuery);
        }

        resolve('success');
      } catch (err) {
        reject(err);
      }
    });
  },

  deleteColumn: function (workflowId, serverInfo, adminDB, workflowDB, columns, primaryKey) {
    return new Promise(async (resolve, reject) => {
      try {
        const workflowTable = 'workflow' + workflowId;
        const workflowEditTable = 'workflow' + workflowId + '_edit';

        const workflow = await Workflow.findOne(workflowId);
        let transferObj = JSON.parse(workflow.transfer);
        for (let i=(transferObj.edit.columns.length - 1); i>0; i--) {
          if (columns.indexOf(transferObj.edit.columns[i]) > -1) {
            if (transferObj.edit.columns[i] != primaryKey) {
              transferObj.edit.columns.splice(i, 1);
            }
          }
        }

        const transferQuery = await DBService.transfer(workflowId, adminDB, workflowDB, transferObj);
        serverInfo.database = adminDB;
        const transferResult = await DBService.queryExecute(serverInfo, transferQuery);
        const updateWorkflow = await Workflow.update(workflowId, {transfer: JSON.stringify(transferObj)});

        let query = 'alter table ' + workflowDB + '.' + workflowEditTable;
        let tempArr = [];
        for (let i=0; i<columns.length; i++) {
          tempArr.push(' drop ' + columns[i]);
        }
        query += tempArr.join(',');
        let result = await DBService.queryExecute(serverInfo, query);

        resolve(result);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }
}
