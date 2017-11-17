/**
 * Created by Harry on 25/05/2017.
 */

module.exports.constant = {
  upload: {
    csv: 'upload-csv',
    table: 'upload-table',
    matrix: 'upload-matrix'
  },
  authType: 'ldap',                           // choose from ldap, activeDirectory, local;
  ldapSettings: {
    url: "",       // server url
    bindDN: "",            // server account dn
    password: "",                       // server account password
    filter: "(objectClass=groupOfNames)",     // filter of the group search
    scope: "sub",                             // scope of the group search
    attributes: ["dn", "cn", "member"],       // returned results' attributes of the group search
    partition: "dc=test,dc=com",              // partition for the group search
    firstName: 'firstName',                   // firstName field name
    lastName: 'sn',                           // lastName field name
    fullName: 'displayName',                  // fullName field name  (if this field has value, firstName and lastName will be ignored)
    userDN: function (username) {
      let userDN = [];

      // the userDN list has priority by order.
      userDN.push("uid=" + username + ",ou=users,dc=test,dc=com");
      userDN.push("cn=" + username + ",ou=users,dc=test,dc=com");
      userDN.push("cn=" + username + ",ou=subusers,ou=users,dc=test,dc=com");

      return userDN;                          // list of all possible user dn
    },
    memberOfAttr: "memberOf",                 // users' memberOf attribute field name
    memberAttr: "member",                     // groups' member attribute field name
    admin: function (param) {
      let adminDN = [];

      adminDN.push("ou=admin,dc=test,dc=com");

      return adminDN;
    },                                        // admin groups' dn
    staff: function (param) {
      let staffDN = [];

      staffDN.push("ou=staff,dc=test,dc=com");

      return staffDN;
    },                                         // staff groups' dn
    student: function (param) {
      let studentDN = [];

      studentDN.push("ou=student,dc=test,dc=com");

      return studentDN;
    }                                          // student groups' dn
  },
  activeDirectory: {
    url: '',
    bindDN: '',
    baseDN: '',
    password: '',
    firstName: 'firstName',                   // firstName field name
    lastName: 'sn',                           // lastName field name
    fullName: 'displayName',                  // fullName field name  (if this field has value, firstName and lastName will be ignored)
    roleAttribute: 'description',                        // if no group info, please use this attribute to by pass group setting, if have group dn, set this to empty or null
    roleAttributeValue: {                                // roleAttribute should be the one of user's attribute. E.g. search user returns {cn: '', dn: '', description: 'Staff'}.
      admin: 'Admin',                                    // Then roleAttribute should be 'description', roleAttributeValue.staff should be 'Staff'
      staff: 'Staff',
      student: 'Student'
    },
    userDN: function (param) {
      let userDN = [];

      // the userDN list has priority by order.
      userDN.push("CN=" + param + ",ou=people" + param.slice(-2) + ",ou=IDM_people,ou=IDM,DC=ad, DC=edu,DC=au");     // example to structure userDN list
      userDN.push("uid=" + param + ",ou=users,dc=test,dc=com");

      return userDN;
    },
    admin: function (param) {
      let adminDN = [];

      adminDN.push("ou=admin,dc=test,dc=com");

      return adminDN;
    },                                        // admin groups' dn
    staff: function (param) {
      let staffDN = [];

      staffDN.push("ou=staff,dc=test,dc=com");

      return staffDN;
    },                                        // staff groups' dn
    student: function (param) {
      let studentDN = [];

      studentDN.push("ou=student,dc=test,dc=com");

      return studentDN;
    }                                         // student groups' dn
  },
  email: {
    config: {
      host: '',
      port: 587,
      secureConnection: false, // use SSL
      tls: {ciphers:"SSLv3"},
      auth: {
        user: '',
        pass: ''
      }
    },
    defaults: {
      from: ''
    }
  },
  serverInfo: {
    config: {
      host: '',
      user: '',
      password: ''
    },

    adminDB: 'ontask_admin',
    workflowDB: 'ontask_workflow'
  },
  domain: ''                               // the node server domain. e.g https://xxxx.com.au
}
