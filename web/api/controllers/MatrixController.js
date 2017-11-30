/**
 * Created by Harry on 13/12/2016.
 */

const mysql = require('mysql');
const archiver = require('archiver');
const unzip = require('unzip');
const fs = require('fs');

module.exports = {
  retrieveData: function (req, res) {
    let serverInfo = sails.config.constant.serverInfo.config;
    let userId = req.session.sUserId || 0;
    let workflowId = req.session.sWorkflowId || 0;
    let adminDB = sails.config.constant.serverInfo.adminDB;
    let workflowDB = sails.config.constant.serverInfo.workflowDB;

    if (userId !== 0 && workflowId !== 0) {
      serverInfo.database = workflowDB;
      serverInfo.multipleStatements = true;

      let query = 'SELECT * FROM ' + mysql.escapeId('workflow' + workflowId);

      DBService.execute(serverInfo, query, function (err, data) {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: err
          });
        } else {
          let temp = {
            name: 'workflow' + workflowId,
            data: data
          }
          return res.ok({
            status: 'success',
            data: temp
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid Info.'
      });
    }
  },

  // create: async (req, res) => {
  //   try {
  //     const workflowId = req.session.sWorkflowId || 0,
  //           serverInfo = sails.config.constant.serverInfo.config,
  //           adminDB = sails.config.constant.serverInfo.adminDB,
  //           workflowDB = sails.config.constant.serverInfo.workflowDB,
  //           columns = req.param('columns'),
  //           datas = req.param('datas');

  //     serverInfo.database = workflowDB;
  //     const createMatrix = await MatriAPI.create(workflowId, serverInfo, primaryKey, columns, datas);
  //   } catch (err) {
  //     return res.badRequest({
  //       status: 'error',
  //       msg: err
  //     });
  //   }
  // }

  // export matrix and related table/edit table
  /* -------------------------------------------
    Example in front end:
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
          var blob = new Blob([this.response], {type: 'application/zip'});
          var fileName = "ontask_data.zip";
          saveAs(blob, fileName);
      }
    }

    var params = '';
    xmlHttp.open('POST', 'matrix/export', true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.responseType = 'arraybuffer';
    xmlHttp.send(params);
  -------------------------------------------- */

  export: async (req, res) => {
    try {
      const userId = req.session.sUserId || 0,
            workflowId = req.param('workflowId') || 0,
            serverInfo = sails.config.constant.serverInfo.config,
            adminDB = sails.config.constant.serverInfo.adminDB,
            workflowDB = sails.config.constant.serverInfo.workflowDB;

      if (userId !== 0 && workflowId !== 0) {
        let workflowTable = 'workflow' + workflowId;
        let workflowEditTable = 'workflow' + workflowId +'_edit';

        const workflow = await Workflow.findOne(workflowId);
        if (workflow.transfer) {
          let transferObj = JSON.parse(workflow.transfer);
          let tables = {};

          for (let i=0; i<transferObj.columns.length; i++) {
            let tableName = transferObj.columns[i].source.split('.')[0];
            let columnName = transferObj.columns[i].source.split('.')[1];
            if (tables.hasOwnProperty(tableName)) {
              if (tables[tableName].indexOf(columnName) < 0) {
                tables[tableName].push(columnName);
              }
            } else {
              tables[tableName] = [];
              tables[tableName].push(columnName);
            }
          }

          let arr = [];

          for (let key in tables) {
            let query = "SELECT * FROM " + adminDB + '.' + key;
            let data = await DBService.queryExecute(serverInfo, query);
            arr.push({
              type: 'csv',
              name: key.replace('ontask_workflow' + workflowId + '_', ''),
              data: data
            });
          }

          let transferTxt = workflow.transfer.replace(new RegExp('ontask_workflow' + workflowId + '_', 'g'), '');
          arr.push({
            type: 'txt',
            name: 'matrix_transfer',
            data: transferTxt
          });
          let query = 'SELECT * FROM ' + workflowDB + '.' + workflowEditTable;
          DBService.execute(serverInfo, query, function (err, data) {
            if (err) {

            } else {
              arr.push({
                type: 'csv',
                name: 'matrix_edit',
                data: data
              });
            }
            ExportService['zip'](arr, function (err, data) {
              res.set('Content-Type', data.type);

              var zip = archiver('zip');

              zip.pipe(res);
              for (var i=0; i<data.data.length; i++) {
                zip.append(data.data[i].data, {name: data.data[i].name + '.' + data.data[i].type});
              }
              zip.finalize();
            });
          });
        //  let data = await DBService.queryExecute(serverInfo, query);
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Matrix does not exists.'
          });
        }
      } else {
        return res.badRequest({
          status: 'error',
          msg: 'Invalid User or Workflow ID.'
        });
      }
    } catch (err) {
      console.log(err);
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  },

  // import matrix zip file to generate new matrix and related data
  import: async (req, res) => {
    try {
      const userId = req.param('userId') || 0;
      const workflowId = req.session.sWorkflowId || 0;
      const serverInfo = sails.config.constant.serverInfo.config;
      const adminDB = sails.config.constant.serverInfo.adminDB;
      const workflowDB = sails.config.constant.serverInfo.workflowDB;

      let uploadFile = req.file('uploadFile');
      let type = req.param('type').toLowerCase();

      if (type == 'zip') {
        uploadFile.upload(function onUploadComplete (err, file) {
          if (err) {
            return res.badRequest({
              status: 'error',
              msg: err
            });
          }
          UploadService[type](file[0].fd, function (err, data) {
            if (err) {
              return res.badRequest({
                status: 'error',
                msg: err
              });
            } else {
              Workflow.findOne(workflowId).exec(async (err, workflow) => {
                try {
                  if (err) {
                    return res.badRequest({
                      status: 'error',
                      msg: err
                    });
                  } else {
                    if (!workflow.transfer) {
                      let result;
                      for (let key in data) {
                        if (key !== 'matrix_edit' && key !== 'matrix_transfer') {
                          result = await DBService.uploadTable(workflowId, serverInfo, adminDB, 'ontask_workflow' + workflowId + '_' + key, data[key]);
                          result = await DBService.uploadDBS({db_name: adminDB, table_name: 'ontask_workflow' + workflowId + '_' + key}, {db_name: adminDB, table_name: 'ontask_workflow' + workflowId + '_' + key}, workflowId);
                        }
                      }
                      if (data['matrix_edit']) {
                        result = await DBService.uploadTable(workflowId, serverInfo, workflowDB, 'workflow' + workflowId + '_edit', data['matrix_edit']);
                      }
                      let transferText = data['matrix_transfer'].text
                      for (let str in data) {
                        if (str !== 'matrix_edit' && str !== 'matrix_transfer') {
                          transferText = transferText.replace(new RegExp(str, 'g'), 'ontask_workflow' + workflowId + '_' + str);
                        }
                      }
                      const workflow = await Workflow.update(workflowId, {transfer: transferText});
                      let transferQuery = await DBService.transfer(workflowId, adminDB, workflowDB, JSON.parse(workflow[0].transfer));
                      transferQuery = transferQuery.replace('alter', 'create or replace');
                      serverInfo.database = adminDB;
                      const transferResult = await DBService.queryExecute(serverInfo, transferQuery);
                      result = await DBService.uploadDBS({db_name: workflowDB, table_name: 'workflow' + workflowId}, {db_name: workflowDB, table_name: 'workflow' + workflowId}, workflowId);
                      return res.json({
                        status: 'success',
                        data: 'success'
                      });
                    } else {
                      return res.badRequest({
                        status: 'error',
                        msg: "Matrix already exists."
                      });
                    }
                  }
                } catch (err) {
                  console.log(err);
                  return res.badRequest({
                    status: 'error',
                    msg: err
                  });
                }
              });
            }
          });
        });
      } else {
        return res.badRequest({
          status: 'error',
          msg: 'Please upload a zip file.'
        });
      }
    } catch (err) {
      console.log(err);
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  }
}
