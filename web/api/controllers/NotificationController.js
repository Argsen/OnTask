/**
 * Created by Harry on 3/02/2017.
 */

const mysql = require('mysql');

module.exports = {
  get: function (req, res) {
    let notificationId = req.param('notificationId');

    if (notificationId) {
      Notification.findOne(notificationId).exec(function (err, notification) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });
        if (notification) {
          return res.ok({
            status: 'success',
            data: notification
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Notification not found.'
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid notification ID.'
      });
    }
  },

  getAll: function (req, res) {
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;
    let ruleId = req.param('ruleId');
    let email = req.param('email');

    if (workflowId) {
      let obj = {
        workflow: workflowId
      }
      if (ruleId) obj.rule = ruleId;
      if (email) obj.email = email;

      Notification.find(obj).exec(function (err, notifications) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });
        if (notifications.length > 0) {
          notifications.sort(function (a, b) {
            var c = new Date(a.createdAt);
            var d = new Date(b.createdAt);
            return d-c;
          });
          return res.ok({
            status: 'success',
            data: notifications
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Notification not found.'
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

  dataTableGet: function (req, res) {
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;
    let ruleId = req.param('ruleId');
    let email = req.param('email');
    let dataTableData = JSON.parse(req.param('dataTableData'));

    if (workflowId) {
      let query = 'select * from notification where workflow=' + mysql.escape(workflowId);
      let countQuery = 'select count(*) from notification where workflow=' + mysql.escape(workflowId);
      if (ruleId) {
        query += ' and rule=' + mysql.escape(ruleId);
        countQuery += ' and rule=' + mysql.escape(ruleId);
      }
      if (email) {
        query += ' and email=' + mysql.escape(email);
        countQuery += ' and email=' + mysql.escape(email);
      }
      if (dataTableData.search.value !== '') {
        query += ' and (`email` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `type` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `status` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `read` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `createdAt` like ' + mysql.escape('%' + dataTableData.search.value + '%') + ')';
        countQuery += ' and (`email` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `type` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `status` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `read` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `createdAt` like ' + mysql.escape('%' + dataTableData.search.value + '%') + ')';
      }
      for (var i=0; i<dataTableData.columns.length; i++) {
        if (dataTableData.columns[i].searchable) {
          switch (dataTableData.columns[i].data) {
            case 0:
              if (!email && dataTableData.columns[i].search.value !== '') {
                query += ' and (`email` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`email` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case 1:
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (`data` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`data` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case 2:
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (`type` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`type` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case 3:
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (`status` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`status` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case 4:
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (`read` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`read` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case 5:
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (`createdAt` like ' + mysql.escape('%' + dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`createdAt` like ' + mysql.escape('%' + dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            default:
              break;
          }
        }
      }
      query += ' order by ';
      for (var i=0; i<dataTableData.order.length; i++) {
        switch (dataTableData.order[i].column) {
          case 0:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `email` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `email` desc ';
            }
            break;
          case 1:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `data` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `data` desc ';
            }
            break;
          case 2:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `type` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `type` desc ';
            }
            break;
          case 3:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `status` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `status` desc ';
            }
            break;
          case 4:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `read` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `read` desc ';
            }
            break;
          case 5:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `createdAt` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `createdAt` desc ';
            }
            break;
          default:
            break;
        }
        if (i < (dataTableData.order.length - 1)) {
          query += ',';
        }
      }
      Notification.query(countQuery, function (err, result) {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: err
          });
        } else {
          if (result) {
            var count = 0;
            count = result[0]['count(*)'];
            if (dataTableData.length > 0) {
              query += ' limit ' + parseInt(dataTableData.start) + ','+ parseInt(dataTableData.length) + ';';
            } else if (dataTableData == -1) {
              query += ';';
            }
            Notification.query(query, function (err, notifications) {
              if (err) return res.badRequest({
                status: 'error',
                msg: err
              });
              if (notifications.length > 0) {
                var arr = [];
                for (var i=0; i<notifications.length; i++) {
                  var tempArr = [];
                  var myDate = new Date(notifications[i].createdAt);
                  var day = myDate.getDate();
                  var month = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'][myDate.getMonth()];
                  var year = myDate.getFullYear();
                  var hour = myDate.getHours();
                  var minute = myDate.getMinutes();

                  if (day < 10) day = '0' + day;
                  if (hour < 10) hour = '0' + hour;
                  if (minute < 10) minute = '0' + minute;
                  tempArr[0] = notifications[i].email;
                  tempArr[1] = '<button class="btn btn-green showNotification">Show</button><div class="notification" style="display: none;">' + notifications[i].data + '</div>';
                  tempArr[2] = notifications[i].type;
                  tempArr[3] = notifications[i].status;
                  tempArr[4] = notifications[i].read;
                  tempArr[5] = day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
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
                  msg: 'Notification not found.'
                });
              }
            });
          } else {
            return res.badRequest({
              status: 'error',
              msg: '0 Record.'
            });
          }
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid info.'
      });
    }
  },

  studentGet: function (req, res) {
    let email = req.param('email');
    let dataTableData = req.param('dataTableData');

    if (email) {
      let query = 'select * from notification where email=' + mysql.escape(email);
      let countQuery = 'select count(*) from notification where email=' + mysql.escape(email);
      if (dataTableData.search.value !== '') {
        query += ' and (email like ' + mysql.escape(dataTableData.search.value + '%') + ' || type like ' + mysql.escape(dataTableData.search.value + '%') + ' || status like ' + mysql.escape(dataTableData.search.value + '%') + ' || createdAt like ' + mysql.escape('%' + dataTableData.search.value + '%') + ')';
        countQuery += ' and (email like ' + mysql.escape(dataTableData.search.value + '%') + ' || type like ' + mysql.escape(dataTableData.search.value + '%') + ' || status like ' + mysql.escape(dataTableData.search.value + '%') + ' || createdAt like ' + mysql.escape('%' + dataTableData.search.value + '%') + ')';
      }
      for (var i=0; i<dataTableData.columns.length; i++) {
        if (dataTableData.columns[i].searchable == 'true') {
          switch (dataTableData.columns[i].data) {
            case '0':
              if (!email && dataTableData.columns[i].search.value !== '') {
                query += ' and (email like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (email like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case '1':
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (data like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (data like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case '2':
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (type like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (type like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case '3':
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (status like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (status like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case '4':
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (createdAt like ' + mysql.escape('%' + dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (createdAt like ' + mysql.escape('%' + dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            default:
              break;
          }
        }
      }
      query += ' order by ';
      for (var i=0; i<dataTableData.order.length; i++) {
        switch (dataTableData.order[i].column) {
          case '0':
            if (dataTableData.order[i].dir == 'asc') {
              query += ' email asc ';
            } else if (dataTableData.order[i].dir = 'desc') {
              query += ' email desc ';
            }
            break;
          case '1':
            if (dataTableData.order[i].dir == 'asc') {
              query += ' data asc '
            } else if (dataTableData.order[i].dir = 'desc') {
              query += ' data desc '
            }
            break;
          case '2':
            if (dataTableData.order[i].dir == 'asc') {
              query += ' type asc '
            } else if (dataTableData.order[i].dir = 'desc') {
              query += ' type asc '
            }
            break;
          case '3':
            if (dataTableData.order[i].dir == 'asc') {
              query += ' status asc '
            } else if (dataTableData.order[i].dir = 'desc') {
              query += ' status asc '
            }
            break;
          case '4':
            if (dataTableData.order[i].dir == 'asc') {
              query += ' createdAt asc '
            } else if (dataTableData.order[i].dir = 'desc') {
              query += ' createdAt desc '
            }
            break;
          default:
            break;
        }
        if (i < (dataTableData.order.length - 1)) {
          query += ',';
        }
      }

      Notification.query(countQuery, function (err, result) {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: err
          });
        } else {
          if (result) {
            var count = 0;
            count = result[0]['count(*)'];
            query += ' limit ' + parseInt(dataTableData.start) + ','+ parseInt(dataTableData.length) + ';';
            Notification.query(query, function (err, notifications) {
              if (err) return res.badRequest({
                status: 'error',
                msg: err
              });
              if (notifications.length > 0) {
                var arr = [];
                for (var i=0; i<notifications.length; i++) {
                  var tempArr = [];
                  var myDate = new Date(notifications[i].createdAt);
                  var day = myDate.getDate();
                  var month = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'][myDate.getMonth()];
                  var year = myDate.getFullYear();
                  var hour = myDate.getHours();
                  var minute = myDate.getMinutes();

                  if (day < 10) day = '0' + day;
                  if (hour < 10) hour = '0' + hour;
                  if (minute < 10) minute = '0' + minute;
                  tempArr[0] = notifications[i].email;
                  tempArr[1] = '<button class="btn btn-green showNotification">Show</button><div class="notification" style="display: none;">' + notifications[i].data + '</div>';
                  tempArr[2] = notifications[i].type;
                  tempArr[3] = notifications[i].status;
                  tempArr[4] = day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
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
                  msg: 'Notification not found.'
                });
              }
            });
          } else {
            return res.badRequest({
              status: 'error',
              msg: '0 Record.'
            });
          }
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid Email'
      });
    }
  },

  notificationExport: function (req, res) {
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;
    let ruleId = req.param('ruleId');
    let email = req.param('email');
    let dataTableData = JSON.parse(decodeURIComponent(req.param('dataTableData')));

    if (workflowId) {
      let query = 'select * from notification where workflow=' + mysql.escape(workflowId);
      let countQuery = 'select count(*) from notification where workflow=' + mysql.escape(workflowId);
      if (ruleId) {
        query += ' and rule=' + mysql.escape(ruleId);
        countQuery += ' and rule=' + mysql.escape(ruleId);
      }
      if (email) {
        query += ' and email=' + mysql.escape(email);
        countQuery += ' and email=' + mysql.escape(email);
      }
      if (dataTableData.search.value !== '') {
        query += ' and (`email` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `type` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `status` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `read` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `createdAt` like ' + mysql.escape('%' + dataTableData.search.value + '%') + ')';
        countQuery += ' and (`email` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `type` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `status` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `read` like ' + mysql.escape(dataTableData.search.value + '%') + ' || `createdAt` like ' + mysql.escape('%' + dataTableData.search.value + '%') + ')';
      }
      for (var i=0; i<dataTableData.columns.length; i++) {
        if (dataTableData.columns[i].searchable) {
          switch (dataTableData.columns[i].data) {
            case 0:
              if (!email && dataTableData.columns[i].search.value !== '') {
                query += ' and (`email` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`email` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case 1:
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (`data` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`data` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case 2:
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (`type` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`type` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case 3:
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (`status` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`status` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case 4:
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (`read` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`read` like ' + mysql.escape(dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            case 5:
              if (dataTableData.columns[i].search.value !== '') {
                query += ' and (`createdAt` like ' + mysql.escape('%' + dataTableData.columns[i].search.value + '%') + ')';
                countQuery += ' and (`createdAt` like ' + mysql.escape('%' + dataTableData.columns[i].search.value + '%') + ')';
              }
              break;
            default:
              break;
          }
        }
      }
      query += ' order by ';
      for (var i=0; i<dataTableData.order.length; i++) {
        switch (dataTableData.order[i].column) {
          case 0:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `email` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `email` desc ';
            }
            break;
          case 1:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `data` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `data` desc ';
            }
            break;
          case 2:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `type` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `type` desc ';
            }
            break;
          case 3:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `status` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `status` desc ';
            }
            break;
          case 4:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `read` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `read` desc ';
            }
            break;
          case 5:
            if (dataTableData.order[i].dir == 'asc') {
              query += ' `createdAt` asc ';
            } else if (dataTableData.order[i].dir == 'desc') {
              query += ' `createdAt` desc ';
            }
            break;
          default:
            break;
        }
        if (i < (dataTableData.order.length - 1)) {
          query += ',';
        }
      }
      Notification.query(countQuery, function (err, result) {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: err
          });
        } else {
          if (result) {
            var count = 0;
            count = result[0]['count(*)'];
            query += ';';
            Notification.query(query, function (err, notifications) {
              if (err) return res.badRequest({
                status: 'error',
                msg: err
              });
              if (notifications.length > 0) {
                var arr = [];
                for (var i=0; i<notifications.length; i++) {
                  var tempArr = [];
                  var myDate = new Date(notifications[i].createdAt);
                  var day = myDate.getDate();
                  var month = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'][myDate.getMonth()];
                  var year = myDate.getFullYear();
                  var hour = myDate.getHours();
                  var minute = myDate.getMinutes();

                  if (day < 10) day = '0' + day;
                  if (hour < 10) hour = '0' + hour;
                  if (minute < 10) minute = '0' + minute;
                  tempArr[0] = notifications[i].email;
                  tempArr[1] = '<button class="btn btn-green showNotification">Show</button><div class="notification" style="display: none;">' + notifications[i].data + '</div>';
                  tempArr[2] = notifications[i].type;
                  tempArr[3] = notifications[i].status;
                  tempArr[4] = notifications[i].read;
                  tempArr[5] = day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
                  arr.push(tempArr);
                }

                let tempData = [];
                for (let i=0; i<arr.length; i++) {
                  tempData.push({
                    "Email": arr[i][0],
                    "Info": JSON.stringify(arr[i][1]),
                    "Type": arr[i][2],
                    "Status": arr[i][3],
                    "Read": arr[i][4],
                    "Created Time": arr[i][5]
                  });
                }

                ExportService['xlsx'](tempData, function (err, data) {
                  res.writeHead(200, {
                    'Content-type': data.type,
                    'Content-length': data.data.length
                  });
                  res.send(data.data);
                });

                // return res.json({
                //   "data": arr,
                //   "recordsTotal": count,
                //   "recordsFiltered": count
                // });
              } else {
                return res.badRequest({
                  status: 'error',
                  msg: 'Notification not found.'
                });
              }
            });
          } else {
            return res.badRequest({
              status: 'error',
              msg: '0 Record.'
            });
          }
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid info.'
      });
    }
  }
};
