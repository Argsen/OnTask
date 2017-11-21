/**
 * Created by Harry on 19/05/2017.
 */

// const for active directory rewrite based on ADtest example
const ActiveDirectory = require('activedirectory');
const config = {
 url:        sails.config.constant.activeDirectory.url,
 bindDN:     sails.config.constant.activeDirectory.bindDN,
 baseDN:     sails.config.constant.activeDirectory.baseDN,
 password:   sails.config.constant.activeDirectory.password
};
const ad = new ActiveDirectory(config);

const ldap = require('ldapjs');
const assert = require('assert');
const async = require('async');



module.exports = {
  local: function (cb) {
    return cb('Invalid Password', null);
  },

  activeDirectory: function (username, password, cb) {
    if(typeof(username) == 'undefined' || username == '') {
      return cb('Invalid Username', null);
    }

    if(typeof(password) == 'undefined' || password == '') {
      return cb('Invalid Password', null);
    }

    let activeDirectorySettings = sails.config.constant.activeDirectory;
    let userDN = activeDirectorySettings.userDN(username);
    let adminDN = activeDirectorySettings.admin(username);
    let staffDN = activeDirectorySettings.staff(username);
    let studentDN = activeDirectorySettings.student(username);
    let groups = {
      admin: false,
      staff: false,
      student: false,
      firstName: '',
      lastName: '',
      fullName: ''
    };

    async.detectSeries(userDN, userAuth, function (err, uniqueUserDN) {
      if (err) {
        return cb(err, null);
      } else {
        if (uniqueUserDN) {
          ad.findUser(uniqueUserDN, function (err, user) {
            if (err) {
              return cb(err, null)
            } else {
              if (user) {
                groups.firstName = user[activeDirectorySettings.firstName];
                groups.lastName = user[activeDirectorySettings.lastName];
                groups.fullName = user[activeDirectorySettings.fullName];

                if (activeDirectorySettings.roleAttribute) {
                  if (user[activeDirectorySettings.roleAttribute] == activeDirectorySettings.roleAttributeValue.admin) {
                    groups.admin = true;
                  }
                  if (user[activeDirectorySettings.roleAttribute] == activeDirectorySettings.roleAttributeValue.staff) {
                    groups.staff = true;
                  }
                  if (user[activeDirectorySettings.roleAttribute] == activeDirectorySettings.roleAttributeValue.student) {
                    groups.student = true;
                  }
                  return cb(null, groups);
                }

                ad.getGroupMembershipForUser(uniqueUserDN, function (err, results) {
                  if (!results || results.length == 0) {
                    return cb(err, null)
                  } else {
                    if (Array.isArray(results)) {
                      for (let i=0; i<results.length; i++) {
                        if (adminDN.indexOf(results[i].dn) > 0) {
                          groups.admin = true;
                          break;
                        }
                      }
                      for (let i=0; i<results.length; i++) {
                        if (staffDN.indexOf(results[i].dn) > 0) {
                          groups.staff = true;
                          break;
                        }
                      }
                      for (let i=0; i<results.length; i++) {
                        if (studentDN.indexOf(results[i].dn) > 0) {
                          groups.student = true;
                          break;
                        }
                      }
                    } else {
                      if (adminDN.indexOf(results.dn) > 0) {
                        groups.admin = true;
                      }
                      if (staffDN.indexOf(results.dn) > 0) {
                        groups.staff = true;
                      }
                      if (studentDN.indexOf(results.dn) > 0) {
                        groups.student = true;
                      }
                    }
                    return cb(null, groups);
                  }
                });
              } else {
                return cb("Authentication error, please check your username and password.")
              }
            }
          });
        } else {
          return cb("Authentication error, please check your username and password.")
        }
      }
    });

    function userAuth(dn, cb) {
      ad.authenticate(dn, password, function(err, auth) {
        if (err) {
          return cb(null, false);
        } else {
          if (auth) {
            return cb(null, true);
          } else {
            return cb(null, false);
          }
        }
      });
    }
  },

  ldap: function (username, password, cb) {
    let ldapSettings = sails.config.constant.ldapSettings;
    let userDN = ldapSettings.userDN(username);
    let adminDN = ldapSettings.admin(username);
    let staffDN = ldapSettings.staff(username);
    let studentDN = ldapSettings.student(username);
    let groups = {
      admin: false,
      staff: false,
      student: false,
      firstName: '',
      lastName: '',
      fullName: ''
    };
    let client = ldap.createClient({
      url: ldapSettings.url,
      timeout: 2000,
      connectTimeout: 2000
    });
    // client.on('error', function (err) {
    //   return cb(err, null);
    // });
    client.on('connectError', function (err) {
      return cb(err, null);
    });
    client.on('timeout', function (err) {
      return cb(err, null);
    });

    async.detectSeries(userDN, userBind, function (err, uniqueUserDN) {
      if (err) {
        return cb(err, null);
      }
      if (uniqueUserDN) {
        let opts = {
          filter: "(objectClass=*)",
          scope: "base"
        };
        client.search(uniqueUserDN, opts, function (err, res) {
          if (err) {
            return cb("Authentication error, please check your username and password.", null);
          }
          res.on('searchEntry', function(entry) {

            groups.firstName = entry.object[ldapSettings.firstName];
            groups.lastName = entry.object[ldapSettings.lastName];
            groups.fullName = entry.object[ldapSettings.fullName];

            if (Array.isArray(entry.object[ldapSettings.memberOfAttr])) {
              for (let i=0; i<entry.object[ldapSettings.memberOfAttr].length; i++) {
                if (adminDN.indexOf(entry.object[ldapSettings.memberOfAttr][i]) > -1) {
                  groups.admin = true;
                  break;
                }
              }
              for (let i=0; i<entry.object[ldapSettings.memberOfAttr].length; i++) {
                if (staffDN.indexOf(entry.object[ldapSettings.memberOfAttr][i]) > -1) {
                  groups.staff = true;
                  break;
                }
              }
              for (let i=0; i<entry.object[ldapSettings.memberOfAttr].length; i++) {
                if (studentDN.indexOf(entry.object[ldapSettings.memberOfAttr][i]) > -1) {
                  groups.student = true;
                  break;
                }
              }
            } else {
              if (adminDN.indexOf(entry.object[ldapSettings.memberOfAttr]) > -1) {
                groups.admin = true;
              }
              if (staffDN.indexOf(entry.object[ldapSettings.memberOfAttr]) > -1) {
                groups.staff = true;
              }
              if (studentDN.indexOf(entry.object[ldapSettings.memberOfAttr]) > -1) {
                groups.student = true;
              }
            }
          });
          res.on('searchReference', function(referral) {
            //console.log('referral: ' + referral.uris.join());
          });
          res.on('error', function(err) {
            //console.error('error: ' + err.message);
          });
          res.on('end', function(result) {
            //console.log('status: ' + result.status);
            client.unbind(function(err) {
              if (err) {
                return cb(null, groups);
              }

              let client = ldap.createClient({
                url: ldapSettings.url
              });
              client.bind(ldapSettings.bindDN, ldapSettings.password, function (err) {
                if (err) {
                  return cb(null, groups);
                }

                let opts = {
                  filter: ldapSettings.filter,
                  scope: ldapSettings.scope,
                  attributes: ldapSettings.attributes
                };
                let searchResults = [];

                client.search(ldapSettings.partition, opts, function (err, res) {
                  if (err) {
                    return cb(null, groups);
                  }
                  res.on('searchEntry', function(entry) {
                    searchResults.push(entry.object);
                  });
                  res.on('searchReference', function(referral) {
                    //console.log('referral: ' + referral.uris.join());
                  });
                  res.on('error', function(err) {
                    //console.error('error: ' + err.message);
                  });
                  res.on('end', function(result) {
                    for (let i=0; i<searchResults.length; i++) {
                      if (adminDN.indexOf(searchResults[i].dn) > -1) {
                        if (Array.isArray(searchResults[i][ldapSettings.memberAttr])) {
                          for (let j=0; j<searchResults[i][ldapSettings.memberAttr].length; j++) {
                            if (searchResults[i][ldapSettings.memberAttr][j] == uniqueUserDN) {
                              groups.admin = true;
                              break;
                            }
                          }
                        } else {
                          if (searchResults[i][ldapSettings.memberAttr] == uniqueUserDN) {
                            groups.admin = true;
                          }
                        }
                      }
                      if (staffDN.indexOf(searchResults[i].dn) > -1) {
                        if (Array.isArray(searchResults[i][ldapSettings.memberAttr])) {
                          for (let j=0; j<searchResults[i][ldapSettings.memberAttr].length; j++) {
                            if (searchResults[i][ldapSettings.memberAttr][j] == uniqueUserDN) {
                              groups.staff = true;
                              break;
                            }
                          }
                        } else {
                          if (searchResults[i][ldapSettings.memberAttr] == uniqueUserDN) {
                            groups.staff = true;
                          }
                        }
                      }
                      if (studentDN.indexOf(searchResults[i].dn) > -1) {
                        if (Array.isArray(searchResults[i][ldapSettings.memberAttr])) {
                          for (let j=0; j<searchResults[i][ldapSettings.memberAttr].length; j++) {
                            if (searchResults[i][ldapSettings.memberAttr][j] == uniqueUserDN) {
                              groups.student = true;
                              break;
                            }
                          }
                        } else {
                          if (searchResults[i][ldapSettings.memberAttr] == uniqueUserDN) {
                            groups.student = true;
                          }
                        }
                      }
                    }

                    return cb(null, groups);

                    client.unbind(function(err) {
                      assert.ifError(err);
                    });
                  });
                });
              });
            });
          });
        });
      } else {
        cb("Authentication error, please check your username and password.")
      }
    });

    function userBind(dn, cb) {
      client.bind(dn, password, function (err) {
        if (err) {
          return cb(null, false);
        }
        return cb(null, true);
      });
    }
  }
};
