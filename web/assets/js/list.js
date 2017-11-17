/**
 * Created by Harry on 6/02/2017.
 */



var list = (function () {
  var module = {};
  module.data = {};
  module.userId = 0;
  module.workflowId = 0;

  module.init = function (url, data, cb) {
    var temp = {};
    for (var i=0; i<data.length; i++) {
      module.get(url, data, data[i], data.length, temp, cb);
    }
  };

  module.get = function (url, original, data, length, temp, cb) {
    $.ajax({
      type: 'POST',
      url: url,
      dataType: 'json',
      data: {database: data},
      error:function(response){
        checkToken(response);
      },
      success: function (response) {
        if (data.length == 0) {
          for (var key in response.data) {
            if (key.indexOf('workflow' + response.workflowId) < 0) {
              delete response.data[key];
            }
          }
          module.data['user' + response.userId] = response.data;
          temp['user' + response.userId] = response.data;
        } else {
          for (var key in response.data) {
            if (key.indexOf('ontask_workflow') > -1 && key.indexOf('ontask_workflow' + response.workflowId) < 0) {
              delete response.data[key];
            }
          }
          module.data[data] = response.data;
          temp[data] = response.data;
        }

        module.userId = response.userId;
        module.workflowId = response.workflowId;
        if (original.indexOf(data) > -1) {
          original.splice(original.indexOf(data), 1);
        }

        if (original.length == 0) {
          return cb(temp);
        }
      }
    });
  };

  module.getStructure = function (db, cb) {
    $.ajax({
      type: 'GET',
      url: 'db/getStructure',
      dataType: 'json',
      data: {},
      error: function (response) {
        checkToken(response);
      },
      success: function (response) {
        console.log(response);
        module.data = response.data;
        module.userId = response.userId;
        module.workflowId = response.workflowId;
        module.adminDB = response.adminDB;
        module.workflowDB = response.workflowDB;
        return cb(response.data);
      }
    });
  };

  module.getData = function (db, table, cb) {
    $.ajax({
      type: 'POST',
      url: 'db/getData',
      dataType: 'json',
      data: {database: db, table: table},
      error: function (response) {
        checkToken(response);
      },
      success: function (response) {
        module.data[db][table].data = response.data;
        return cb(response.data);
      }
    });
  };

  return module;
}());
