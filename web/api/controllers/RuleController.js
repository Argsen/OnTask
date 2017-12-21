/**
 * Created by Harry on 13/12/2016.
 */

const mysql = require('mysql');
const archiver = require('archiver');
const unzip = require('unzip');
const fs = require('fs');

const RuleController = {
  create: function (req, res) {
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;
    let name = req.param('name');

    if (name && workflowId !== 0) {
      let ruleData = {
        name: name,
        workflow: workflowId
      };
      let description = req.param('description');
      let schedule = req.param('schedule');
      let action = req.param('action');
      let condition = req.param('condition');
      let data = req.param('data');
      if (description) ruleData.description = description;
      if (schedule) ruleData.schedule = schedule;
      if (action) ruleData.action = action;
      if (condition) ruleData.condition = condition;
      if (data) ruleData.data = data;

      Rule.create(ruleData).exec(function (err, rule) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });

        if (rule) {
          return res.created({
            status: 'success',
            data: rule
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Error creating rule.'
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid info.'
      });
    }
  },

  get: function (req, res) {
    let ruleId = req.param('ruleId');

    if (ruleId) {
      Rule.findOne(ruleId).exec(function (err, rule) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });
        if (rule) {
          return res.ok({
            status: 'success',
            data: rule
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Rule not found.'
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid rule ID.'
      });
    }
  },

  getAll: function (req, res) {
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;

    if (workflowId) {
      Rule.find({workflow: workflowId}).exec(function (err, rules) {
        if (err) {
          return res.json({
            status: 'error',
            msg: err
          });
        } else {
          if (rules.length > 0) {
            return res.ok({
              status: 'success',
              data: rules
            });
          } else {
            return res.json({
              status: 'error',
              msg: 'Rule not found.'
            });
          }
        }
      });
    } else {
      return res.json({
        status: 'error',
        msg: 'Invalid workflow ID.'
      });
    }
  },

  update: function (req, res) {
    let ruleId = req.param('ruleId');

    if (ruleId) {
      let ruleData = {};
      let name = req.param('name');
      let description = req.param('description');
      let schedule = req.param('schedule');
      let action = req.param('action');
      let condition = req.param('condition');
      let data = req.param('data');
      if (name) ruleData.name = name;
      if (description) ruleData.description = description;
      if (schedule) ruleData.schedule = schedule;
      if (action) ruleData.action = action;
      if (condition) ruleData.condition = condition;
      if (data) ruleData.data = data;

      Rule.update(ruleId, ruleData).exec(function (err, rules) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });
        if (rules.length > 0) {
          return res.ok({
            status: 'success',
            data: rules[0]
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Error updating rule.'
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid rule ID.'
      });
    }
  },

  delete: function (req, res) {
    let ruleId = req.param('ruleId');

    if (ruleId) {
      Rule.destroy(ruleId).exec(function (err) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });
        return res.ok({
          status: 'success'
        });
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid rule ID.'
      });
    }
  },

  ruleRun: function (req, res) {
    let userId = req.param('userId') || req.session.sUserId || 0;
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;
    let ruleId = req.param('ruleId');
    let serverInfo = sails.config.constant.serverInfo.config;
    let customAttributes = req.param('customAttributes');
    let runType = req.param('runType');

    if (userId && workflowId && ruleId) {
      Rule.findOne(ruleId).exec(function (err, rule) {
        if (err) {
          console.log(err);
        } else {
          if (rule) {
            let conditions = JSON.parse(rule.condition);
            if (!conditions) {
              console.log('Please create conditions and save rule first.');
            }
              let action = rule.action;
              let notificationType = JSON.parse(rule.data).notificationType;
              let superCondition = JSON.parse(rule.data).superCondition;
              let emailSubject = JSON.parse(rule.data).emailSubject;
              let fromEmailAddress = JSON.parse(rule.data).fromEmailAddress;

              serverInfo.database = sails.config.constant.serverInfo.workflowDB;
              serverInfo.multipleStatements = true;

              // create a snapshot for workflow table
              DBService.execute(serverInfo, 'CREATE TABLE if not exists workflow' + workflowId + '_' + Date.now() + ' AS SELECT * FROM workflow' + workflowId, function (err, data) {

              });

              DBService.execute(serverInfo, 'SELECT * FROM ' + mysql.escapeId('workflow' + workflowId), function (err, data) {
                if (err) {
                  console.log(err);
                } else {
                  for (var i=0; i<data.length; i++) {
                    if (!data[i].email || (conditions[superCondition] && !eval(expressionConstruct(conditions[superCondition], data[i], '')))) {

                    } else {
                      var temp = action;
                      var columns = [];
                      temp.replace(/{{(.*?)}/g, function (g0, g1) {
                        columns.push(g1);
                      });

                      var result = action;

                      for (var j=0; j<columns.length; j++) {
                        if (columns[j].indexOf(':') < 0) {
                          if (columns[j].indexOf('-') < 0) {
                            if (data[i][columns[j]]) {
                              result = result.replace('{{' + columns[j] + '}}', data[i][columns[j]]);
                            } else {
                              result = result.replace('{{' + columns[j] + '}}', '');
                            }
                          } else {
                            if (customAttributes && columns[j].split('-')[1] && customAttributes[columns[j].split('-')[1]]) {
                              result = result.replace('{{' + columns[j] + '}}', customAttributes[columns[j].split('-')[1]]);
                            }
                          }
                        } else {
                          var conditionName = columns[j].split(':')[0];
                          var conditionBoolean = columns[j].split(':')[1];

                          if (conditions[conditionName]) {
                            var expressionResult = '';
                            expressionResult = expressionConstruct(conditions[conditionName], data[i], expressionResult);
                            var part1 = result.split('{{' + columns[j] + '} : {')[0];
                            var part2 = result.split('{{' + columns[j] + '} : {')[1];
                            if (part2) {
                              var removeString = result.substr(part1.length, columns[j].length + 7 + part2.indexOf('}}') + 2);
                            } else {
                              var removeString = '';
                            }
                            if (eval(expressionResult) == eval(conditionBoolean.toLowerCase())) {
                              result = result.replace('{{' + columns[j] + '} : {', '');
                              result = result.replace('}}', '');
                            } else {
                              result = result.replace(removeString, '');
                            }
                          }
                        }
                      }

                      var pattern1 = '<p></p>',
                        re1 = new RegExp(pattern1, "g");
                      var pattern2 = '<p>&nbsp;</p>',
                        re2 = new RegExp(pattern2, "g");
                      result = result.replace(re1, '');
                      result = result.replace(re2, '');

                      let notificationObj = {
                        workflow: workflowId,
                        rule: ruleId,
                        email: data[i].email,
                        type: '',
                        status: '',
                        read: 'false',
                        data: result,
                        subject: emailSubject,
                        from: fromEmailAddress
                      };

                      if (notificationType.notification) {
                        notificationObj.type = 'notification';
                        notificationObj.status = (runType == 'test') ? 'test' : 'created';
                        Notification.create(notificationObj).exec(function (err, notification){

                        });
                      }
                      if (notificationType.email) {
                        notificationObj.type = 'email';
                        if (runType == 'test') {
                          notificationObj.status = 'test';
                          Notification.create(notificationObj).exec(function (err, notification){

                          });
                        } else {
                          notificationObj.status = 'created';
                          sendEmail(userId, notificationObj, data[i].email, result);
                        }
                      }
                    }
                    if (i == (data.length - 1)) {
                      let msg = "Rule has finished running. Email sending in process, might take a while, please check this rule's summary";
                      if (runType == 'test') {
                        msg = "Rule test run has been processed. Please check this rule's summary.";
                      }
                    }
                  }
                }
              });
          } else {
            console.log('Cannot find rule.');
          }
        }
      });
    } else {
      console.log('Not valid user, workflow or rule ID.')
    }
  },

  run: function (req, res) {
    let userId = req.param('userId') || req.session.sUserId || 0;
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;
    let ruleId = req.param('ruleId');
    let serverInfo = sails.config.constant.serverInfo.config;
    let customAttributes = req.param('customAttributes');
    let runType = req.param('runType');

    if (userId && workflowId && ruleId) {
      Rule.findOne(ruleId).exec(function (err, rule) {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: err
          });
        } else {
          if (rule) {
            let conditions = JSON.parse(rule.condition);
            if (!conditions) {
              return res.badRequest({
                status: 'error',
                msg: 'Please create conditions and save rule first.'
              });
            }
            const schedule = rule.schedule || sails.config.constant.ruleRunSchedule;
            const scheduleEnable = JSON.parse(rule.data).notificationType.schedule;
            if (scheduleEnable && schedule && runType !== 'test') {
              let obj = {
                userId: userId,
                workflowId: workflowId,
                ruleId: ruleId,
                serverInfo: serverInfo,
                customAttributes: customAttributes,
                runType: runType,
                rule: rule
              }
              CronJobService.ruleRun(obj);
              return res.json({
                status: 'success',
                data: 'Action Success. The rule will run based on schedule.'
              });
            } else {
              let action = rule.action;
              let notificationType = JSON.parse(rule.data).notificationType;
              let superCondition = JSON.parse(rule.data).superCondition;
              let emailSubject = JSON.parse(rule.data).emailSubject;
              let fromEmailAddress = JSON.parse(rule.data).fromEmailAddress;

              serverInfo.database = sails.config.constant.serverInfo.workflowDB;
              serverInfo.multipleStatements = true;

              // create a snapshot for workflow table
              DBService.execute(serverInfo, 'CREATE TABLE if not exists workflow' + workflowId + '_' + Date.now() + ' AS SELECT * FROM workflow' + workflowId, function (err, data) {

              });

              DBService.execute(serverInfo, 'SELECT * FROM ' + mysql.escapeId('workflow' + workflowId), function (err, data) {
                if (err) {
                  return res.badRequest({
                    status: 'error',
                    msg: err
                  });
                } else {
                  for (var i=0; i<data.length; i++) {
                    if (!data[i].email || (conditions[superCondition] && !eval(expressionConstruct(conditions[superCondition], data[i], '')))) {

                    } else {
                      var temp = action;
                      var columns = [];
                      temp.replace(/{{(.*?)}/g, function (g0, g1) {
                        columns.push(g1);
                      });

                      var result = action;

                      for (var j=0; j<columns.length; j++) {
                        if (columns[j].indexOf(':') < 0) {
                          if (columns[j].indexOf('-') < 0) {
                            if (data[i][columns[j]]) {
                              result = result.replace('{{' + columns[j] + '}}', data[i][columns[j]]);
                            } else {
                              result = result.replace('{{' + columns[j] + '}}', '');
                            }
                          } else {
                            if (customAttributes && columns[j].split('-')[1] && customAttributes[columns[j].split('-')[1]]) {
                              result = result.replace('{{' + columns[j] + '}}', customAttributes[columns[j].split('-')[1]]);
                            }
                          }
                        } else {
                          var conditionName = columns[j].split(':')[0];
                          var conditionBoolean = columns[j].split(':')[1];

                          if (conditions[conditionName]) {
                            var expressionResult = '';
                            expressionResult = expressionConstruct(conditions[conditionName], data[i], expressionResult);
                            var part1 = result.split('{{' + columns[j] + '} : {')[0];
                            var part2 = result.split('{{' + columns[j] + '} : {')[1];
                            if (part2) {
                              var removeString = result.substr(part1.length, columns[j].length + 7 + part2.indexOf('}}') + 2);
                            } else {
                              var removeString = '';
                            }
                            if (eval(expressionResult) == eval(conditionBoolean.toLowerCase())) {
                              result = result.replace('{{' + columns[j] + '} : {', '');
                              result = result.replace('}}', '');
                            } else {
                              result = result.replace(removeString, '');
                            }
                          }
                        }
                      }

                      var pattern1 = '<p></p>',
                        re1 = new RegExp(pattern1, "g");
                      var pattern2 = '<p>&nbsp;</p>',
                        re2 = new RegExp(pattern2, "g");
                      result = result.replace(re1, '');
                      result = result.replace(re2, '');

                      let notificationObj = {
                        workflow: workflowId,
                        rule: ruleId,
                        email: data[i].email,
                        type: '',
                        status: '',
                        read: 'false',
                        data: result,
                        subject: emailSubject
                      };

                      if (notificationType.notification) {
                        notificationObj.type = 'notification';
                        notificationObj.status = (runType == 'test') ? 'test' : 'created';
                        Notification.create(notificationObj).exec(function (err, notification){

                        });
                      }
                      if (notificationType.email) {
                        notificationObj.type = 'email';
                        if (runType == 'test') {
                          notificationObj.status = 'test';
                          Notification.create(notificationObj).exec(function (err, notification){

                          });
                        } else {
                          notificationObj.status = 'created';
                          sendEmail(userId, notificationObj, data[i].email, result);
                        }
                      }
                    }
                    if (i == (data.length - 1)) {
                      let msg = "Rule has finished running. Email sending in process, might take a while, please check this rule's summary";
                      if (runType == 'test') {
                        msg = "Rule test run has been processed. Please check this rule's summary.";
                      }
                      return res.json({
                        status: 'success',
                        data: msg
                      });
                    }
                  }
                }
              });
            }
          } else {
            return res.badRequest({
              status: 'error',
              msg: 'Cannot find rule.'
            });
          }
        }
      });
    } else {
      res.badRequest({
        status: 'error',
        msg: 'Not valid user, workflow or rule ID.'
      });
    }
  },

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

    var params = 'type=' + type + '&ruleId=' + ruleId;
    xmlHttp.open('POST', 'matrix/export', true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.responseType = 'arraybuffer';
    xmlHttp.send(params);
  -------------------------------------------- */

  export: async (req, res) => {
    try {
      const userId = req.session.sUserId || 0;
      const ruleId = req.param('ruleId');
      const type = req.param('type');
      const workflowId = req.session.sWorkflowId || 0,
            serverInfo = sails.config.constant.serverInfo.config,
            adminDB = sails.config.constant.serverInfo.adminDB,
            workflowDB = sails.config.constant.serverInfo.workflowDB;

      if (userId && ruleId) {
        const workflow = await Workflow.findOne(workflowId);

        if (type === 'include' && workflow.transfer) {
          let workflowTable = 'workflow' + workflowId;
          let workflowEditTable = 'workflow' + workflowId +'_edit';
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
            let query = "SELECT " + tables[key].join(',') + " FROM " + adminDB + '.' + key;
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
          let rule = await Rule.findOne(ruleId);
          delete rule.id;
          arr.push({
            type: 'txt',
            name: 'ontask_rule',
            data: JSON.stringify(rule)
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
        } else {
          let arr = [];
          let rule = await Rule.findOne(ruleId);
          delete rule.id;
          arr.push({
            type: 'txt',
            name: 'ontask_rule',
            data: JSON.stringify(rule)
          });
          ExportService['zip'](arr, function (err, data) {
            res.set('Content-Type', data.type);

            var zip = archiver('zip');

            zip.pipe(res);
            for (var i=0; i<data.data.length; i++) {
              zip.append(data.data[i].data, {name: data.data[i].name + '.' + data.data[i].type});
            }
            zip.finalize();
          });
        }
      } else {
        res.badRequest({
          status: 'error',
          msg: 'Not valid user, or rule ID.'
        });
      }
    } catch (err) {
      res.badRequest({
        status: 'error',
        msg: err
      });
    }
  },

  import: async (req, res) => {
    try {
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
          UploadService[type](file[0].fd, async (err, data) => {
            try {
              if (err) {
                return res.badRequest({
                  status: 'error',
                  msg: err
                });
              } else {
                for (let attr in data) {
                  if (attr == 'ontask_rule') {
                    let obj = JSON.parse(data[attr].text);
                    obj.workflow = workflowId;
                    let rule = await Rule.create(obj);
                  } else {
                    let result;
                    if (attr !== 'matrix_edit' && attr !== 'matrix_transfer') {
                      result = await DBService.uploadTable(workflowId, serverInfo, adminDB, 'ontask_workflow' + workflowId + '_' + attr, data[attr]);
                      result = await DBService.uploadDBS({db_name: adminDB, table_name: 'ontask_workflow' + workflowId + '_' + attr}, {db_name: adminDB, table_name: 'ontask_workflow' + workflowId + '_' + attr}, workflowId);
                    }
                  }
                }
                if (data['matrix_edit']) {
                  result = await DBService.uploadTable(workflowId, serverInfo, workflowDB, 'workflow' + workflowId + '_edit', data['matrix_edit']);
                }
                if (data['matrix_transfer']) {
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
                }
                return res.json({
                  status: 'success',
                  data: 'success'
                });
              }
            } catch (err) {
              return res.badRequest({
                status: 'error',
                msg: err
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
      res.badRequest({
        status: 'error',
        msg: err
      });
    }
  }
};

module.exports = RuleController;

function sendEmail(userId, notificationObj, email, result) {
  Notification.create(notificationObj).exec(function (err, notification){
    if (err) {
      console.log(err);
    } else {
      User.findOne(userId).exec(function (err, user) {
        let emailObj = {
          to: email,
          subject: notificationObj.subject,
          text: result,
          html: '<p><b>Please do not reply this email, please reply to</b> <a href="mailto:' + user.email + '">' + user.email + '</a>.<img style="display: none;" src="' + sails.config.constant.domain + '/image?' + Buffer.from('notificationId=' + notification.id).toString('base64') + '" /></p>' + result
        };
        EmailService.send(emailObj, function (err, info) {
          if (err) {
            notification.status = 'failed';
          } else {
            notification.status = 'sent';
          }
          Notification.update(notification.id, notification).exec(function (err, notification){

          });
        });
      });
    }
  });
}

function expressionConstruct(condition, data, expressionResult) {
  for (var i=0; i<condition.length; i++) {
    if (condition[i].expressions) {
      expressionResult = expressionResult + '(';
      expressionResult = expressionConstruct(condition[i].expressions, data, expressionResult);
      if (i < (condition.length - 1)) {
        expressionResult += ') ' + condition[i].logical + ' '
      } else {
        expressionResult += ') '
      }
    } else {
      if ((condition[i].symbol == ">" || condition[i].symbol == ">=" || condition[i].symbol == "<=" || condition[i].symbol == "<") && (!isNumber(data[condition[i].target]) || (/^0[0-9].*$/.test(data[condition[i].target])))) {
        let temp1 = new Date(data[condition[i].target]);
        let temp2 = new Date(condition[i].value);

        if (temp1 != 'Invalid Date' && temp2 != 'Invalid Date') {
          expressionResult += String(temp1.getTime()) + ' ';
          expressionResult += condition[i].symbol + ' ';
          expressionResult += String(temp2.getTime()) + ' ';

          if (condition[i].logical && i < (condition.length - 1)) {
            expressionResult += condition[i].logical + ' ';
          }
        } else {
          expressionResult = "false";
          return "false";
        }
      } else {
        if (isNumber(data[condition[i].target]) && !(/^0[0-9].*$/.test(data[condition[i].target]))) {
          expressionResult += String(data[condition[i].target]) + ' ';
        } else {
          expressionResult += '"' + String(data[condition[i].target]) + '"' + ' ';
        }
        expressionResult += condition[i].symbol + ' ';
        if (/^\+?(0|[1-9]\d*)$/.test(condition[i].value.replace(/"/g, ''))) {
          expressionResult += String(condition[i].value.replace(/"/g, '')) + ' ';
        } else {
          expressionResult += '"' + String(condition[i].value.replace(/"/g, '')) + '"' + ' ';
        }

        if (condition[i].logical && i < (condition.length - 1)) {
          expressionResult += condition[i].logical + ' ';
        }
      }
    }
  }
  return expressionResult;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
