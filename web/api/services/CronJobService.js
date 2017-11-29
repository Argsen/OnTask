const cronJob = require('cron').CronJob;
let jobs = {};

const CronJobService = {
  // importOutSourceData: function (obj, cb) {
  //   let identifier = {
  //     db_name: sails.config.constant.serverInfo.adminDB,
  //     table_name: 'ontask_workflow' + obj.workflowId + '_' + obj.table
  //   }
  //   let cronObj = {
  //     type: 'importOutSourceData',
  //     identifier: JSON.stringify(identifier),
  //     data: JSON.stringify(obj),
  //     schedule: obj.schedule
  //   }
  //
  //   CronJob.findOne({identifier: identifier}).exec(function (err, result) {
  //     if (err) {
  //       cb(err, null);
  //     } else {
  //       if (result) {
  //         CronJob.update({identifier: identifier}, cronObj).exec(function (err, result) {
  //           if (err) {
  //             cb(err, null)
  //           } else {
  //             cb(null, 'success');
  //           }
  //         })
  //       } else {
  //         CronJob.create(cronObj).exec(function (err, result) {
  //           if (err) {
  //             cb(err, null)
  //           } else {
  //             cb(null, 'success');
  //           }
  //         });
  //       }
  //     }
  //   });
  //
  //   const j = schedule.scheduleJob()
  // },
  //
  // createJob: function (identifier, schedule) {
  //   const j = schedule.scheduleJob(identifier, schedule, function () {
  //
  //   });
  // },

  initial: function () {
    getActiveCronJobs();
  },

  importOutSourceData: function (obj) {
    return new Promise(async(resolve, reject) => {
      try {
        let identifier = {
          db_name: sails.config.constant.serverInfo.adminDB,
          table_name: 'ontask_workflow' + obj.workflowId + '_' + obj.table
        }
        let cronObj = {
          type: 'importOutSourceData',
          identifier: JSON.stringify(identifier),
          data: JSON.stringify(obj),
          schedule: obj.schedule
        }
        let result = await CronJob.findOne({type: 'importOutSourceData', identifier: cronObj.identifier});
        if (result) {
          if (jobs['job' + result.id]) {
            jobs['job' + result.id].jobObj.stop();
            result = await CronJob.update({type: 'importOutSourceData', identifier: cronObj.identifier}, cronObj);
            result = result[0];
          } else {
            jobs['job' + result.id] = {};
            jobs['job' + result.id].type = cronObj.type;
            jobs['job' + result.id].identifier = cronObj.identifier;
          }
          jobs['job' + result.id].data = cronObj.data;
          jobs['job' + result.id].schedule = cronObj.schedule;
        } else {
          result = await CronJob.create(cronObj);
          jobs['job' + result.id] = {};
          jobs['job' + result.id].type = cronObj.type;
          jobs['job' + result.id].identifier = cronObj.identifier;
          jobs['job' + result.id].data = cronObj.data;
          jobs['job' + result.id].schedule = cronObj.schedule;
        }

        const importDataJob = new cronJob(obj.schedule, async() => {
          try {
            DBService.outSource(obj, function (err, data) {
              uploadDBS({db_name: sails.config.constant.serverInfo.adminDB, table_name: 'ontask_workflow' + obj.workflowId + '_' + obj.table}, {db_name: sails.config.constant.serverInfo.adminDB, table_name: 'ontask_workflow' + obj.workflowId + '_' + obj.table}, obj.workflowId, function (err, result) {
                if (err) {
                  // write to log
                } else {
                  Dbs.update({db_name: sails.config.constant.serverInfo.adminDB, table_name: 'ontask_workflow' + obj.workflowId + '_' + obj.table}, {connection_string: JSON.stringify(obj)}).exec(function (err, result) {

                  });
                }
              });
            });
          } catch (err) {
            console.log(err);
          //  log.error(err);
          }
        }, null, true, sails.config.constant.cronJobTimeZone);
        jobs['job' + result.id].jobObj = importDataJob;
        resolve(importDataJob);
      } catch (err) {
        reject(err);
      }
    });
  },

  ruleRun: function (obj) {
    return new Promise(async(resolve, reject) => {
      try {
        let identifier = {ruleId: obj.ruleId}
        let cronObj = {
          type: 'ruleRun',
          identifier: JSON.stringify(identifier),
          data: JSON.stringify(obj),
          schedule: obj.rule.schedule
        }
        let result = await CronJob.findOne({type: 'ruleRun', identifier: cronObj.identifier});
        if (result) {
          if (jobs['job' + result.id]) {
            jobs['job' + result.id].jobObj.stop();
            result = await CronJob.update({type: 'ruleRun', identifier: cronObj.identifier}, cronObj);
            result = result[0];
          } else {
            jobs['job' + result.id] = {};
            jobs['job' + result.id].type = cronObj.type;
            jobs['job' + result.id].identifier = cronObj.identifier;
          }
          jobs['job' + result.id].data = cronObj.data;
          jobs['job' + result.id].schedule = cronObj.schedule;
        } else {
          result = await CronJob.create(cronObj);
          jobs['job' + result.id] = {};
          jobs['job' + result.id].type = cronObj.type;
          jobs['job' + result.id].identifier = cronObj.identifier;
          jobs['job' + result.id].data = cronObj.data;
          jobs['job' + result.id].schedule = cronObj.schedule;
        }
        const ruleRunJob = new cronJob(cronObj.schedule, function (obj) {
          ruleRunFunc(obj);
        }, null, true, sails.config.constant.cronJobTimeZone);
        jobs['job' + result.id].jobObj = ruleRunJob;
        resolve(ruleRunJob);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = CronJobService;

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

async function getActiveCronJobs() {
  try {
    CronJob.find().exec(function (err, result) {
      if (err) {
        console.log(err);
      } else {
        if (result.length > 0) {
          for (let i=0; i<result.length; i++) {
            let obj = {
              id: result[i].id,
              identifier: result[i].identifier,
              type: result[i].type,
              schedule: result[i].schedule,
              data: result[i].data
            };
            if (result[i].type == 'importOutSourceData') {
              CronJobService.importOutSourceData(JSON.parse(obj.data));
            } else if (result[i].type == 'ruleRun') {
              CronJobService.ruleRun(JSON.parse(obj.data));
            } else {}
          }
        }
      }
    });
  } catch (err) {
    //log.error(err);
    console.log(err)
  }
}

function ruleRunFunc(obj) {
  let userId = obj.userId;
  let workflowId = obj.workflowId;
  let ruleId = obj.ruleId;
  let serverInfo = obj.serverInfo;
  let customAttributes = obj.customAttributes;
  let runType = obj.runType;
  let rule = obj.rule;
  let action = rule.action;
  let notificationType = JSON.parse(rule.data).notificationType;
  let superCondition = JSON.parse(rule.data).superCondition;
  let emailSubject = JSON.parse(rule.data).emailSubject;
  let conditions = JSON.parse(rule.condition);

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
        expressionResult = "false";
        return "false";
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
