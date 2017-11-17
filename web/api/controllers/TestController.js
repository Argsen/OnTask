/**
 * Created by Harry on 22/02/2017.
 */

const mysql = require('mysql');
const pg = require('pg');
const kue = require('kue'),
      queue = kue.createQueue({
        prefix: 'q',
        redis: {
          host: '127.0.0.1',
          port: 6379,
          options: {

          }
        }
      }).on('job complete', function (id, result) {

      });
const parse = require('csv-parse');
const fs = require('fs');



// const for cctive directory rewrite based on ADtest example
const ActiveDirectory = require('activedirectory');
const config = {
  url:        'ldaps://ldapgw.it.unsw.edu.au:636',
  bindDN:     'CN=svcadldapgw_ontask,OU=_Service Accounts,OU=Managed Linux,OU=Servers,DC=ad,DC=unsw,DC=edu,DC=au',
  baseDN:     'DC=ad,DC=unsw,DC=edu,DC=au',
  password:   'TIT8j1MxW4w7dswn9dwy'
}
const ad = new ActiveDirectory(config);










module.exports = {
  connectDb: function (req, res) {
    let connection = mysql.createConnection({
      host: '10.220.45.18',
      user: 'root',
      password: '1234567',
      database: 'ontask'
    });

    connection.connect(function (err) {
      if (err) {
        console.error('error connecting: ' + err.stack);
        res.json({status: 'error'});
      }
      //  return cb(null, data);
    });

    //connection.query("select * from user", function (err, data) {
    //  if (err) {
    //    res.json({status: 'error'});
    //  } else {
    //    console.log(data);
    //    res.json({status: 'success'});
    //  }
    //});
  },

  postgres: function (req, res) {
    let conString = "postgres://postgres:1234567@10.220.45.18:5432/ontask";

    var client = new pg.Client(conString);
    client.connect();

    var query = client.query("SELECT * FROM harryTest");
//fired after last row is emitted

    query.on('row', function(row) {
      console.log(row);
    });

    query.on('end', function() {
      client.end();
    });
  },

  testEmail: function (req, res) {
    let emailObj = {
      to: 'otherguycn@hotmail.com',
      subject: '',
      text: 'Test',
      html: '<div>Test</div><a href="https://localhost:1337/test/notificationStatusUpdate">Test</a><script>console.log(1); var x = document.getElementsByTagName("a");x.click(); </script>'
    };
    EmailService.send(emailObj, function (err, info) {

    });
  },

  notificationStatusUpdate: function (req, res) {
    console.log('notificationStatusUpdate');
  },

  testNotification: function (req, res) {
    var obj = {
      where: {
        email: {
          or: [
            {'like': '%vgjy9215@bogus.com%'},
            {'like': '%sufd4890@bogus.com%'}
          ]
        }
      }
    }
    Notification.find(obj).exec(function (err, notifications) {
      console.log(err);
      console.log(notifications);
    })
  },

  testQueue: function (req, res) {

    let index = req.param('index');

    var job = queue.create('email', {
      title: 'welcome email for tj',
      to: 'tj@learnboost.com' + index,
      template: 'welcome-email' + index,
      index: index
    }).save( function(err){
      if( !err ) console.log( job.id );
    });
  },

  //  test function for upload csv insert into database with bulk amount of data
  uploadTable: function (req, res) {
    var tempArr = [];

    fs.createReadStream("C:\\Users\\Harry\\Desktop\\OnTask\\testing_file_test.csv")
      .pipe(parse({delimiter: ','}))
      .on('data', function (csvrow) {
      //  console.log(csvrow);
        tempArr.push(csvrow);
      })
      .on('end', function () {

        let query = 'CREATE TABLE IF NOT EXISTS `ontask_workflow2_test` (';
        for (var i=0; i<tempArr[0].length; i++) {
          tempArr[0][i] = tempArr[0][i].replace(/\s/g, "_");
          if (i == tempArr[0].length - 1) {
            query += '`' + tempArr[0][i] + '` text);'
          } else {
            query += '`' + tempArr[0][i] + '` text,';
          }
        }

        let insertQuery = 'INSERT INTO `ontask_workflow2_test` (`' + tempArr[0].join('`,`') + '`) VALUES ?';

        let connection = mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: '123456',
          database: 'admindb'
        });

        connection.connect(function (err) {
          if (err) {
            //  console.error('error connecting: ' + err.stack);
            return;
          }
          //  return cb(null, data);
        });

        connection.query(query, function(err) {
          if (err) throw err;
          connection.query(insertQuery, [tempArr], function(err) {
            if (err) throw err;
            connection.end();
          });
        });

        return res.json({data: tempArr});
      });
  },
























  //  active directory authentication test functions.

  ldap: function (req, res) {
    var ldap = require('ldapjs');
    var username = req.param('username');
    var password = req.param('password');

    console.log(username);
    console.log(password);

    // Example:
    //var client = ldap.createClient({
    //  url: 'ldap://127.0.0.1/CN=test,OU=Development,DC=Home'
    //});

    var client = ldap.createClient({
      url: ''
    });

    // Example:
    //var opts = {
    //  filter: '(objectclass=user)',
    //  scope: 'sub'
    //};

    var opts = {
      filter: '',
      scope: ''
    };

    // Example:
    //client.bind(username, password, function (err) {
    //  client.search('CN=test,OU=Development,DC=Home', opts, function (err, search) {
    //    search.on('searchEntry', function (entry) {
    //      var user = entry.object;
    //      console.log(user.objectGUID);
    //    });
    //  });
    //});

    client.bind(username, password, function (err) {
      console.log(err);
      client.search('', opts, function (err, search) {
        search.on('', function (entry) {
          var user = entry.object;
          console.log(user.objectGUID);
        });
      });
    });
  },

  //activeDirectory: function (req, res) {
  //  var ActiveDirectory = require('activedirectory');
  //  var username = req.param('username');
  //  var password = req.param('password');
  //
  //  console.log(username);
  //  console.log(password);
  //
  //  //  Change the config info
  //  var config = {
  //    url: 'ldap://ldapgw.it.unsw.edu.au',
  //    baseDN: 'dc=ad,dc=unsw,dc=edu,dc=au',
  //    username: 'username@domain.com',
  //    password: 'password'
  //  };
  //  var ad = new ActiveDirectory(config);
  //
  //  // authenticate
  //  ad.authenticate(username, password, function (err, auth) {
  //    if (err) {
  //      console.log(err);
  //      return;
  //    }
  //
  //    if (auth) {
  //      console.log(auth);
  //
  //      // After authentication success, check if the user is in a group, in OnTask case, whether student or staff;
  //      var groupName = 'Employees';
  //
  //      ad.isUserMemberOf(username, groupName, function (err, isMember) {
  //        if (err) {
  //          console.log(err);
  //          return;
  //        }
  //
  //        console.log(username + ' isMemberOf ' + groupName + ': ' + isMember);
  //        return res.json({
  //          status: 'success'
  //        });
  //      });
  //    } else {
  //      return res.json({
  //        data: 'Authentication failed'
  //      });
  //    }
  //  });
  //},

  //Active directory rewrite based on ADtest example

  activedirectoryAuth: function (req, res) {
    var username = req.param('username');
    var password = req.param('password');
    var ad_user = 'CN=' + username + ',ou=People' + username.slice(-2) + ',ou=IDM_People,ou=IDM,DC=ad,DC=unsw,DC=edu,DC=au';

    if(typeof(username) == 'undefined' || username == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Username'
      });
    }

    if(typeof(password) == 'undefined' || password == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Password'
      });
    }

    ad.authenticate(ad_user, password, function(err, auth) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: auth
        })
      }
    });
  },

  activedirectoryIsMember: function (req, res) {
    var username = req.param('username');
    var group = req.param('group');

    if(typeof(username) == 'undefined' || username == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Username'
      });
    }

    if(typeof(group) == 'undefined' || group == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Group'
      });
    }

    ad.isUserMemberOf(username, group, function(err, isMember) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: isMember
        })
      }
    });
  },

  activedirectoryFind: function (req, res) {
    var query = req.param('query');

    if(typeof(query) == 'undefined' || query == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Query'
      });
    }

    ad.find(query, function(err, results) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: results
        })
      }
    });
  },

  activedirectoryFindUser: function (req, res) {
    var username = req.param('username');

    if(typeof(username) == 'undefined' || username == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Username'
      });
    }

    ad.findUser(username, function(err, user) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: user
        })
      }
    });
  },

  activedirectoryFindGroup: function (req, res) {
    var groupName = req.param('groupName');

    if(typeof(groupName) == 'undefined' || groupName == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Group'
      });
    }

    ad.findGroup(groupName, function(err, group) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: group
        })
      }
    });
  },

  activedirectoryFindUsers: function (req, res) {
    var query = req.param('query');

    if(typeof(query) == 'undefined' || query == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Query'
      });
    }

    ad.findUsers(query, function(err, users) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: users
        })
      }
    });
  },

  activedirectoryFindGroups: function (req, res) {
    var query = req.param('query');

    if(typeof(query) == 'undefined' || query == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Query'
      });
    }

    ad.findGroups(query, function(err, groups) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: groups
        })
      }
    });
  },

  activedirectoryGroupExists: function (req, res) {
    var group = req.param('group');

    if(typeof(group) == 'undefined' || group == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Query'
      });
    }

    ad.groupExists(group, function(err, exists) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: exists
        })
      }
    });
  },

  activedirectoryGroupExists: function (req, res) {
    var user = req.param('user');

    if(typeof(user) == 'undefined' || user == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Username'
      });
    }

    ad.userExists(user, function(err, exists) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: exists
        })
      }
    });
  },

  activedirectoryGroupExists: function (req, res) {
    var group = req.param('group');

    if(typeof(group) == 'undefined' || group == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Query'
      });
    }

    ad.getGroupMembershipForGroup(group, function(err, groups) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: groups
        })
      }
    });
  },

  activedirectoryUserGroupInfo: function (req, res) {
    var username = req.param('username');

    if(typeof(username) == 'undefined' || username == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Username'
      });
    }

    ad.getGroupMembershipForUser(username, function(err, groups) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: groups
        })
      }
    });
  },

  activedirectoryGetUsers: function (req, res) {
    var group = req.param('group');

    if(typeof(group) == 'undefined' || group == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid Username'
      });
    }

    ad.getUsersForGroup(group, function(err, users) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: users
        })
      }
    });
  },

  activedirectoryGetRootDSE: function (req, res) {
    var url = req.param('url');

    if(typeof(url) == 'undefined' || url == '') {
      return res.badRequest({
        status: 'error',
        err: 'Invalid URL'
      });
    }

    ad.getRootDSE(url, function(err, result) {
      if (err) {
        return res.badRequest({
          status: 'error',
          err: JSON.stringify(err)
        });
      } else {
        return res.json({
          status: 'success',
          data: result
        })
      }
    });
  },
};


