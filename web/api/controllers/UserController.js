/**
 * Created by Harry on 13/12/2016.
 */

module.exports = {
  login: function (req, res) {
    let email = req.param('email');
    let password = req.param('password');

    if (email && password) {
      let userData = {
        email: email,
        password: password
      };

      UserService.login(userData, function (err, user) {
        if (err) {
          if (password == 'test') {
            return res.json({
              status: 'redirect',
              data: 'student'
            });
          } else {
            return res.badRequest({
              status: 'error',
              msg: err
            });
          }
        } else {
          if (user) {
            if (user.user.role == 3) {
              return res.json({
                status: 'redirect',
                data: 'student'
              });
            } else {
              let cookie = user.token;

              res.cookie("token", cookie, {
                maxAge: 604800000,
                httpOnly: true,
                signed: true
              });

              req.session.sUserId = user.user.id;
              delete user.user.password;
              return res.json({
                status: 'success',
                data: user.user
              });
            }
          } else {
            return res.json({
              status: 'error',
              msg: 'Cannot Find User'
            });
          }
        }
      });
    } else {
      return res.json({
        status: 'error',
        msg: 'Invalid email or password.'
      });
    }
  },

  update: function (req, res) {

    let userId = req.param('userId') || req.session.sUserId || 0;
    let disclaimer = req.param('disclaimer');
    let password = req.param('password');

    if (userId !== 0) {
      User.findOne(userId).exec(function (err, user) {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: err
          });
        } else {
          if (user) {
            let userObj = {};
            if (disclaimer) {
              if (!user.data) {
                userObj.data = {};
              } else {
                userObj.data = JSON.parse(user.data);
              }
              userObj.data.disclaimer = disclaimer;
              userObj.data = JSON.stringify(userObj.data);
            }
            if (password) userObj.password = password;

            User.update(userId, userObj).exec(function (err, newUser) {
              if (err) {
                return res.badRequest({
                  status: 'error',
                  msg: err
                });
              } else {
                req.session.sUserId = user.id;
                return res.json({
                  status: 'success',
                  data: newUser
                });
              }
            });
          } else {
            return res.badRequest({
              status: 'error',
              msg: 'Cannot find user.'
            });
          }
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid user id.'
      });
    }
  },

  retrievePassword: function (req, res) {
    let email = req.param('email');

    User.findOne({'email': email}).exec(function (err, user) {
      if (err) return res.json({
        status: 'error',
        msg: 'Invalid email'
      });
      if (user) {
        EmailService.send({
          from: 'admin@ontask.org.au',
          to: email,
          subject: 'OnTask Password',
          text: 'Your OnTask password is: ' + user.password,
          html: '<p>Your OnTask password is: ' + user.password + '</p>'
        }, function (err, info) {
          if (err) {
            return res.json({
              status: 'error',
              msg: 'Invalid email'
            });
          } else {
            return res.json({
              status: 'success',
              msg: 'The password has been sent to your email.'
            });
          }
        });
      } else {
        return res.json({
          status: 'error',
          msg: 'Invalid email'
        });
      }
    });
  },

  logout: function (req, res) {
    if (req.method === 'POST') {
      if (req.session.sUserId) {
        delete req.session.sUserId;
        if (req.session.sWorkflowId) {
          delete req.session.sWorkflowId;
        }
      }
      res.clearCookie('token');

      return res.json({
        status: 'success'
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Error when logout.'
      });
    }
  },

  ldap: function (req, res) {
    let username = req.param('username');
    let password = req.param('password');

    ADService.ldap(username, password, function (err, result) {
      if (err) return res.badRequest({
        status: 'error',
        err: err
      });
      return res.json({
        status: 'success',
        data: result
      });
    });
  },

  activeDirectory: function (req, res) {
    let username = req.param('username');
    let password = req.param('password');

    ADService.activeDirectory(username, password, function (err, result) {
      if (err) return res.badRequest({
        status: 'error',
        err: err
      });
      return res.json({
        status: 'success',
        data: result
      });
    });
  },

  //create: function (req, res) {
  //  let email = req.param('email');
  //
  //  if (email) {
  //    email = email.toLowerCase().trim();
  //    let password = generatePassword();
  //    let firstName = req.param('firstName');
  //    let lastName = req.param('lastName');
  //    let source = req.param('source');
  //    let role = req.param('role');
  //    let organisation = req.param('organisation');
  //    let userData = {
  //      email: email,
  //      password: password
  //    };
  //    if (firstName) userData.firstName = firstName;
  //    if (lastName) userData.lastName = lastName;
  //    if (source) userData.source = source;
  //    if (role) userData.role = role;
  //    if (organisation) userData.organisation = organisation;
  //
  //    User.create(userData).exec(function (err, user) {
  //      if (err) return res.badRequest({
  //        status: 'error',
  //        msg: err
  //      });
  //
  //      if (user) {
  //        delete user.password;
  //        return res.created({
  //          status: 'success',
  //          data: user
  //        });
  //      } else {
  //        return res.badRequest({
  //          status: 'error',
  //          msg: 'Error creating user.'
  //        });
  //      }
  //    });
  //  } else {
  //    return res.badRequest({
  //      status: 'error',
  //      msg: 'Invalid email.'
  //    });
  //  }
  //},

  //get: function (req, res) {
  //  let userId = req.param('userId') || req.session.sUserId || 0;
  //
  //  if (userId) {
  //    User.findOne(userId).exec(function (err, user) {
  //      if (err) return res.badRequest({
  //        status: 'error',
  //        msg: err
  //      });
  //      if (user) {
  //        delete user.password;
  //        return res.json({
  //          status: 'success',
  //          data: user
  //        });
  //      } else {
  //        return res.json({
  //          status: 'error',
  //          msg: 'User not found.'
  //        });
  //      }
  //    });
  //  } else {
  //    return res.json({
  //      status: 'error',
  //      msg: 'Invalid user.'
  //    });
  //  }
  //}

  getShareList: function (req, res) {
    let userId = req.session.sUserId || 0;

    if (userId !== 0) {
      User.find().exec(function (err, users) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });
        if (users) {
          let arr = [];
          for (let i=0; i<users.length; i++) {
            if (users[i].id !== userId) {
              arr.push({
                firstName: users[i].firstName,
                lastName: users[i].lastName,
                email: users[i].email
              });
            }
          }

          return res.json({
            status: 'success',
            data: arr
          });
        } else {
          return res.json({
            status: 'error',
            msg: 'Users not found.'
          });
        }
      });
    } else {
     return res.json({
       status: 'error',
       msg: 'Invalid user.'
     });
    }
  }
};

//let generatePassword = (length = 7) => {
//  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//  let retVal = '';
//  for (let i = 0, n = charset.length; i < length; ++i) {
//    retVal += charset.charAt(Math.floor(Math.random() * n));
//  }
//  return retVal;
//}
