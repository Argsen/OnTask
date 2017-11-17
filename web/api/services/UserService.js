/**
 * Created by Harry on 14/12/2016.
 */

var mysql = require('mysql');
const express = require('express');
const querystring = require('querystring');
const http = require('http');
const app = express();

module.exports = {
  login: function (data, cb) {

    //-----
    // pass data to worker
    //-----

    User.findOne({email: data.email}).populate('role').exec(function (err, user) {
      if (err) {
        return cb(err, null)
      } else if (!user) {
        ADService[sails.config.constant.authType](data.email, data.password, function (err, result) {
          if (err) return cb(err, null);
          let userData = {
            email: data.email
          }
          if (result.admin) {
            userData.role = 1;
          } else {
            if (result.staff) {
              userData.role = 2;
            } else {
              if (result.student) {
                userData.role = 3;
              } else {
                return cb('Authentication Failed', null);
              }
            }
          }
          if (result.firstName && result.lastName) {
            userData.firstName = result.firstName;
            userData.lastName = result.lastName;
          } else if ((!result.firstName || !result.lastName) && result.lastName) {
            userData.firstName = result.lastName;
          } else {

          }

          User.create(userData).exec(function (err, newUser) {
            if (err) return cb(err);

            let role = '';
            switch (newUser.role) {
              case 1:
                role = 'admin';
                break;
              case 2:
                role = 'staff';
                break;
              case 3:
                role = 'student';
                break;
              default:
                break;
            }

            signToken(newUser.email, role, function (chunk) {
              // createDB(newUser, function (err) {
              //   if (err) {
              //     return cb(err, null);
              //   } else {
                   return cb(null, {user: newUser, token: JSON.parse(chunk).token});
              //   }
              // });
            });
          });
        });
      } else {
        if (user.password == data.password) {
          signToken(user.email, user.role.role, function (chunk) {
            // createDB(user, function (err) {
            //   if (err) {
            //     return cb(err, null);
            //   } else {
                 return cb(null, {user: user, token: JSON.parse(chunk).token});
            //   }
            // });
          });
        } else {
          ADService[sails.config.constant.authType](data.email, data.password, function (err, result) {
            if (err) {
              return cb(err, null);
            } else {
              let userData = {
                email: data.email
              }
              if (result.admin) {
                userData.role = 1;
              } else {
                if (result.staff) {
                  userData.role = 2;
                } else {
                  if (result.student) {
                    userData.role = 3;
                  } else {
                    return cb('Authentication Failed', null);
                  }
                }
              }
              if (result.firstName && result.lastName) {
                userData.firstName = result.firstName;
                userData.lastName = result.lastName;
              } else if ((!result.firstName || !result.lastName) && result.lastName) {
                userData.firstName = result.lastName;
              } else {

              }

              User.update(user.id, userData).exec(function (err, newUser) {
                if (err || newUser.length == 0) return cb(err);

                let role = '';
                switch (newUser[0].role) {
                  case 1:
                    role = 'admin';
                    break;
                  case 2:
                    role = 'staff';
                    break;
                  case 3:
                    role = 'student';
                    break;
                  default:
                    break;
                }

                signToken(newUser[0].email, role, function (chunk) {
                  // createDB(newUser[0], function (err) {
                  //   if (err) {
                  //     return cb(err, null);
                  //   } else {
                       return cb(null, {user: newUser[0], token: JSON.parse(chunk).token});
                  //   }
                  // });
                });
              });
            }
          });
        }
      }
    });
  }
}


function signToken(user, role, cb) {
  let data = JSON.stringify({
    user: user,
    role: role
  });
  let options = {
    hostname: '127.0.0.1',
    port: 8088,
    path: '/sign',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  let req = http.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      return cb(chunk);
    });
  });

  req.write(data);
  req.end();
}

// function createDB(user, cb) {
//   let connection = mysql.createConnection(sails.config.constant.serverInfo.config);
//
//   connection.connect(function (err) {
//     if (err) {
//       return cb(err);
//     }
//   });
//
//   connection.query('CREATE DATABASE IF NOT EXISTS ' + mysql.escapeId('user' + user.id), function(err, result) {
//     if (err) {
//       return cb(err);
//     } else {
//       return cb(null)
//     }
//   });
//
//   connection.end();
// }
