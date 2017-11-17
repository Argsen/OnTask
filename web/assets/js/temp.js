/**
 * Created by Harry on 12/12/2016.
 */


//------------------- CSV Upload && create csv table into user database --------------------------

//$("#uploadSubmit").click(function (e) {
//  e.preventDefault();
//
//  uploadFile.upload($('#uploadForm'), 'file/upload', 'csv', function (response) {
//
//    $.ajax({
//      type: 'POST',
//      url: 'db/uploadTable',
//      dataType: 'json',
//      data: {userId: 1, serverInfo: serverInfo, name: $('#uploadFile')[0].files[0].name.replace('.', '_'), data: response.data},
//      success: function (response) {
//        console.log(response);
//      }
//    });
//
//    $('#uploadFile').val('');
//  });
//});

//------------------- File Export ------------------------------

//$("#exportFile").click(function () {
//  var csvData = [
//    {
//      ID: 1,
//      FirstName: 'Harry',
//      LastName: 'Cui'
//    },
//    {
//      ID: 2,
//      FirstName: 'Xiao',
//      LastName: 'Cui'
//    },
//    {
//      ID: 3,
//      FirstName: '',
//      LastName: 'Cui'
//    }
//  ];
//  var pdfData = '123';
//
//  exportFile.export(csvData, 'file/export', 'csv', function (response, type) {
//    var blob = new Blob([response], {type: type});
//    var fileName = "test.csv";
//    saveAs(blob, fileName);
//  });
//
//  exportFile.export(pdfData, 'file/export', 'pdf', function (response, type) {
//    var blob = new Blob([response], {type: type});
//    var fileName = "test.pdf";
//    saveAs(blob, fileName);
//  });
//});


//--------------- Retrieve DB Structure and Data --------------------------

//var dbInfo = {
//  host: 'localhost',
//  user: 'root',
//  password: '123456',
//  database: 'ontask'
//}
//
//var serverInfo = {
//  host: 'localhost',
//  user: 'root',
//  password: '123456'
//}

//$.ajax({
//  type: 'POST',
//  url: 'db/connection',
//  dataType: 'json',
//  data: {},
//  success: function (response) {
//    console.log(response);
//  }
//});

//----------------- Create DB for each User -------------------

//$.ajax({
//  type: 'POST',
//  url: 'db/createDB',
//  dataType: 'json',
//  data: {serverInfo: serverInfo, userId: 1},
//  success: function (response) {
//    console.log(response);
//  }
//});

//-----------------------  Matrix Transformer ---------------------------

//let workflowId = 1;
//let columnName = "email";
//let columnType = "VARCHAR(255)";
//// let query = "CREATE TABLE workflow" + workflowId + " (id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY)";
//let query = "ALTER TABLE workflow" + workflowId + " ADD COLUMN " + columnName + " " + columnType + "; " + "INSERT INTO workflow" + workflowId + " ( " + columnName + " = CONCAT(myguests.email, '@gmail.com')";

//$.ajax({
//  type: 'POST',
//  url: 'db/transform',
//  dataType: 'json',
//  data: {serverInfo: serverInfo, query: query, userId: 1},
//  success: function (response) {
//    console.log(response);
//  }
//});

//-------------- Retrieve User Data Source List --------------

//$.ajax({
//  type: 'POST',
//  url: 'user/login',
//  dataType: 'json',
//  data: {'email': '123@g.com', 'password': '123'},
//  success: function (response) {
//    $.ajax({
//      type: 'POST',
//      url: 'workflow/get',
//      dataType: 'json',
//      data: {workflowId: 1},
//      success: function (response) {
//        $.ajax({
//          type: 'POST',
//          url: 'db/get',
//          dataType: 'json',
//          data: {},
//          success: function (response) {
//            for (var i=0; i<response.data.length; i++) {
//              $.ajax({
//                type: 'POST',
//                url: 'db/connection',
//                dataType: 'json',
//                data: {dbInfo: JSON.parse(response.data[i].connection_string)},
//                success: function (response) {
//                  console.log(response);
//                }
//              });
//            }
//          }
//        });
//      }
//    });
//  }
//});

//------------------------ Data Import from data source -------------------------------

//$("#dbSubmit").click(function (e) {
//  e.preventDefault();
//
//  var connection = {
//    host: $("#dbHost").val(),
//    user: $("#dbUser").val(),
//    password: $("#dbPassword").val(),
//    database: $("#dbDatabase").val()
//  }
//
//  $.ajax({
//    type: 'POST',
//    url: 'db/create',
//    dataType: 'json',
//    data: {'connection': connection},
//    success: function (response) {
//      $("#dbHost").val('');
//      $("#dbUser").val('');
//      $("#dbPassword").val('');
//      $("#dbDatabase").val('');
//    }
//  });
//});


//-------------------------- Matrix Convert ------------------------------

//var oldColumn = {
//  Default: null,
//  Extra: "",
//  Field: "email",
//  Key: "UNIQUE",
//  Null: "YES",
//  Type: "varchar(255)"
//}
//
//var newColumn = {
//  Default: null,
//  Extra: "AUTO_INCREMENT",
//  Field: "emailNew",
//  Key: "PRIMARY KEY",
////  Key: "UNIQUE",
//  //  Key: "INDEX",
//  //  Key: "UNIQUE",
//  Null: "NOT NULL",
////  Null: "NULL",
//  Type: "int"
//}

//$.ajax({
//  type: 'POST',
//  url: 'matrix/convert',
//  dataType: 'json',
//  data: {serverInfo: serverInfo, userId: 1, tableName: 'test', oldColumn: oldColumn, newColumn: newColumn},
//  success: function (response) {
//    console.log(response);
//  }
//});

//--------------- Matrix Transformer --------------------------

//var queryTransformer = '';

//$.ajax({
//  type: 'POST',
//  url: 'matrix/transform',
//  dataType: 'json',
//  data: {serverInfo: serverInfo, userId: 1, query: queryTransformer},
//  success: function (response) {
//    console.log(response);
//  }
//});

//-------------------- Rule Create -----------------------

//var ruleActionName = 'Test';
//var ruleAction = {
//  email: ' ',
//  notification: ' '
//}
//var ruleSchedule = ' ';
//var ruleDescription = ' ';
//var ruleData = ' ';

//$.ajax({
//  type: 'POST',
//  url: 'rule/create',
//  dataType: 'json',
//  data: {workflowId: 1, name: ruleActionName, data: ruleData, action: ruleAction, schedule: ruleSchedule, description: ruleDescription},
//  success: function (response) {
//    console.log(response);
//  }
//});

// ---------------- Data import transfer column to workflow table ------------


//var dbs = {};
//var userId = 1;
//var workflowId = 1;
//
//$.ajax({
//  type: 'POST',
//  url: 'db/get',
//  dataType: 'json',
//  data: {workflowId: 1},
//  success: function (response) {
//    for (var i=0; i<response.data.length; i++) {
//      dbs[JSON.parse(response.data[i].connection_string).database] = {};
//      dbConnection(JSON.parse(response.data[i].connection_string));
//    }
//  }
//});
//
//function dbConnection(connection_string) {
//  $.ajax({
//    type: 'POST',
//    url: 'db/connection',
//    dataType: 'json',
//    data: {dbInfo: connection_string},
//    success: function (response) {
//      dbs[connection_string.database] = response.data;
//    }
//  });
//}
//
//$("#createKeyColumn").click(function () {
//  var dbName = $("#dbName").val();
//  var tableName = $("#tableName").val();
//  var dataKeyColumn = $("#dataKeyColumn").val();
//  var workflowKeyColumn = $("#workflowKeyColumn").val();
//  var keyStructure;
//
//  for (var i=0; i<dbs[dbName][tableName].columns.length; i++) {
//    if (dbs[dbName][tableName].columns[i].Field == dataKeyColumn) {
//      if (dbs[dbName][tableName].columns[i].Key == 'PRI' || dbs[dbName][tableName].columns[i].Key == 'UNI') {
//        keyStructure = dbs[dbName][tableName].columns[i];
//      } else {
//        alert('Key column value must be unique');
//      }
//    }
//  }
//
//  if (dbs['user' + userId]['workflow' + workflowId].data.length != 0) {
//    alert('Already have a primary key.');
//  } else {
//    $.ajax({
//      type: 'POST',
//      url: 'db/transferKey',
//      dataType: 'json',
//      data: {dbName: dbName, tableName: tableName, dataKeyColumn: dataKeyColumn, workflowKeyColumn: workflowKeyColumn, keyStructure: keyStructure},
//      success: function (response) {
//        console.log(response);
//      }
//    });
//  }
//});
//
//$("#dataTransfer").click(function () {
//  var dbName = $("#dbName").val().toLowerCase();
//  var tableName = $("#tableName").val().toLowerCase();
//  var dataColumn = ['email', 'name'];
//  var dataKeyColumn = $("#dataKeyColumn").val().toLowerCase();
//  var workflowKeyColumn = $("#workflowKeyColumn").val().toLowerCase();
//
//  for (var i=0; i<dbs[dbName][tableName].columns.length; i++) {
//    if (dbs[dbName][tableName].columns[i].Field == dataKeyColumn) {
//      if (dbs[dbName][tableName].columns[i].Key == 'PRI' || dbs[dbName][tableName].columns[i].Key == 'UNI') {
//        keyStructure = dbs[dbName][tableName].columns[i];
//      } else {
//        alert('Key column value must be unique');
//      }
//    }
//  }
//
//  if (dbs['user' + userId]['workflow' + workflowId].data.length == 0) {
//    alert('Please set primary key column first.');
//  } else {
//    var db = $("#dbName").val();
//    var dataColumn = $("#dataColumn").val();
//    var dataKeyColumn = $("#dataKeyColumn").val();
//
//    $.ajax({
//      type: 'POST',
//      url: 'db/transfer',
//      dataType: 'json',
//      data: {dbName: dbName, dataColumn: dataColumn, dataKeyColumn: dataKeyColumn, workflowKeyColumn: workflowKeyColumn},
//      success: function (response) {
//
//      }
//    });
//  }
//});


// --------------------- Rule -------------------------------------

//var ruleColumns = [];
//var ruleNum = 0;
//$("#addRule").click(function () {
//  ruleNum++;
//  rule.add($("#rule"), ruleColumns, ruleNum);
//});
//
//$("#confirmRule").click(function () {
//  var temp = rule.value();
//  for (var i=0; i<temp.length; i++) {
//    $("#selectCondition").append('<option>' + temp[i].name + '</option>');
//  }
//});
//
//$('.jqte-test').jqte();
//
//$.ajax({
//  type: 'POST',
//  url: 'db/connection',
//  dataType: 'json',
//  data: {},
//  success: function (response) {
//    if (response.status != "error") {
//      for (var key in response.data) {
//        if (key == 'workflow' + response.workflowId) {
//          for (var i=0; i<response.data[key].columns.length; i++) {
//            ruleColumns.push(response.data[key].columns[i].Field);
//            $("#selectKey").append("<option>" + response.data[key].columns[i].Field + "</option>");
//          }
//        }
//      }
//    }
//  }
//});
//
//function insertTextAtCursor(text) {
//  var sel, range, html;
//  if (window.getSelection) {
//    sel = window.getSelection();
//    if (sel.getRangeAt && sel.rangeCount) {
//      range = sel.getRangeAt(0);
//      if (range.commonAncestorContainer == $(".jqte_editor")[0] || range.commonAncestorContainer.parentNode == $(".jqte_editor")[0] || $(".jqte_editor")[0].contains(range.commonAncestorContainer.parentNode)) {
//        range.deleteContents();
//        range.insertNode( document.createTextNode(text) );
//      }
//    }
//  } else if (document.selection && document.selection.createRange) {
//    document.selection.createRange().text = text;
//  }
//}
//
//$("#insertKey").click(function () {
//  insertTextAtCursor('{' + $("#selectKey").val() + '}');
//});
//
//$("#insertCondition").click(function () {
//  insertTextAtCursor('{' + $("#selectCondition").val() + '}');
//});
//
//$("#insertBoolean").click(function () {
//  insertTextAtCursor('{' + $("#selectBoolean").val() + '}');
//});
//
//$.ajax({
//  type: 'POST',
//  url: 'notification/get',
//  dataType: 'json',
//  data: {notificationId: 1},
//  success: function (response) {
//    console.log(response);
//  }
//});
//
//$.ajax({
//  type: 'POST',
//  url: 'notification/getAll',
//  dataType: 'json',
//  data: {workflowId: 1, ruleId: 1, email: 'otherguycn@hotmail.com'},
//  success: function (response) {
//    console.log(response);
//  }
//});
//
//$.ajax({
//  type: 'POST',
//  url: 'rule/testRun',
//  dataType: 'json',
//  data: {ruleId: 1},
//  success: function (response) {
//    console.log(response);
//  }
//});

//--------------------------------------------------------- 06/02/2017 Changes ----------------------------------------------------------------

// general list function

//list.init('db/connection', ['admindb'], function (response) {
//  console.log(response);
//});

// export

//$("#exportFile").click(function () {
//  var csvData = [
//    {
//      ID: 1,
//      FirstName: 'Harry',
//      LastName: 'Cui'
//    },
//    {
//      ID: 2,
//      FirstName: 'Xiao',
//      LastName: 'Cui'
//    },
//    {
//      ID: 3,
//      FirstName: '',
//      LastName: 'Cui'
//    }
//  ];
//  var pdfData = '123';
//  var exportData = [
//    {type: 'csv', name: 'test', data: csvData},
//    {type: 'pdf', name: 'test', data: pdfData}
//  ];
//
//  //var exportTables = [
//  //  {type: 'csv', name: 'admindb-info', data: []},
//  //  {type: 'csv', name: 'admindb-staff', data: []},
//  //  {type: 'csv', name: 'user1-workflow1', data: []}
//  //]
//
//  exportFile.export(exportData, 'file/export', 'zip', function (response, type) {
//    var blob = new Blob([response], {type: type});
//    var fileName = "data.zip";
//    saveAs(blob, fileName);
//  });
//});









// Data association redo
//---- Data Association Pre-step: get transferObj from database;

//var transferObj = {};
//$.ajax({
//  type: 'POST',
//  url: 'workflow/get',
//  dataType: 'json',
//  data: {},
//  success: function (response) {
//    if (response.data.transfer) {
//      transferObj = JSON.parse(response.data.transfer);
//    }
//  }
//});
//
////--- Data Association Step 1: create primary key
//
//$("#createPK").click(function () {
//  associationColumnCreate(transferObj, 'info', 'info.id', 'id', function (err, obj) {
//    if (err) {
//      alert(err)
//    } else {
//      $.ajax({
//        type: 'POST',
//        url: 'db/transfer',
//        dataType: 'json',
//        data: {transferObj: JSON.stringify(obj)},
//        success: function (response) {
//
//        }
//      });
//    }
//  });
//});
//
//
////--- Data Association Step 2 : Add column
//
//$("#addC").click(function () {
//  var columns = [
//    {
//      source: 'test.id',
//      target: 'test_id'
//    },
//    {
//      source: 'test.test1',
//      target: 'test1'
//    }
//  ];
//  associationColumnAdd(transferObj, 'test', columns, 'test.id', 'info.id', 'outer', function (err, obj) {
//    if (err) {
//      alert(err)
//    } else {
//      $.ajax({
//        type: 'POST',
//        url: 'db/transfer',
//        dataType: 'json',
//        data: {transferObj: JSON.stringify(obj)},
//        success: function (response) {
//
//        }
//      });
//    }
//  });
//});
//
////--- Data Association Step 3: Delete Column
//
//$("#deleteC").click(function () {
//  var columns = [
//    {
//      source: 'test.id',
//      target: 'test_id'
//    },
//    {
//      source: 'test.test1',
//      target: 'test1'
//    }
//  ];
//  console.log(transferObj);
//  associationColumnDelete(transferObj, columns, function (err, obj) {
//    if (err) {
//      alert(err)
//    } else {
//      $.ajax({
//        type: 'POST',
//        url: 'db/transfer',
//        dataType: 'json',
//        data: {transferObj: JSON.stringify(obj)},
//        success: function (response) {
//
//        }
//      });
//    }
//  });
//});



// Matrix Internal Transform

// Matrix internal transform pre-step:  get workflow view info.

//list.init('db/connection', [''], function (dbInfo) {
//  $.ajax({
//    type: 'POST',
//    url: 'workflow/get',
//    dataType: 'json',
//    data: {},
//    success: function (response) {
//      if (response.data.transfer) {
//        transferObj = JSON.parse(response.data.transfer);
//        var columns = dbInfo['user' + list.userId]['workflow' + list.workflowId].columns;
//
//        for (var i=0; i<transferObj.columns.length; i++) {
//          for (var j=0; j<columns.length; j++) {
//            if (transferObj.columns[i].target == columns[j].Field) {
//              switch (true) {
//                case (columns[j].Type.indexOf('int') > -1):
//                  transformColumnInsert(columns[j].Field, transferObj.columns[i].source);
//                  break;
//                case (columns[j].Type.indexOf('decimal') > -1):
//                  transformColumnInsert(columns[j].Field, transferObj.columns[i].source);
//                  break;
//                case (columns[j].Type.indexOf('float') > -1):
//                  transformColumnInsert(columns[j].Field, transferObj.columns[i].source);
//                  break;
//                case (columns[j].Type.indexOf('double') > -1):
//                  transformColumnInsert(columns[j].Field, transferObj.columns[i].source);
//                  break;
//                default:
//                  break;
//              }
//            }
//          }
//        }
//      }
//    }
//  });
//});

//$("#transform_column_insert").click(function () {
//  $("#transform_equation").append('<div style="display: inline !important;" type="column" value="' + $("#transform_column").val() + '">' + $("#transform_column  option:selected").text() + '</div>');
//});
//
//$("#transform_operator_insert").click(function () {
//  $("#transform_equation").append('<div style="display: inline !important;" type="operator" value="' + $("#transform_operator").val() + '">' + $("#transform_operator").val() + '</div>');
//});
//
//$("#transform_clear").click(function () {
//  $("#transform_equation").empty();
//});
//
//$("#transform_confirm").click(function () {
//  var temp = '';
//  $("#transform_equation div").each(function () {
//    if ($(this).attr('type') == 'column') {
//      temp += 'coalesce(' + $(this).attr('value') + ',0)';
//    } else if ($(this).attr('type') == 'operator') {
//      temp += $(this).attr('value');
//    }
//  });
//  if ($("#transform_new_column_name").val() && temp.length > 0) {
//    transferObj.columns.push({
//      source: temp,
//      target: $("#transform_new_column_name").val()
//    });
//  }
//
//  $.ajax({
//    type: 'POST',
//    url: 'db/transfer',
//    dataType: 'json',
//    data: {transferObj: JSON.stringify(transferObj)},
//    success: function (response) {
//      $("#transform_equation").empty();
//    }
//  });
//});
//
//function transformColumnInsert(field, value) {
//  var option = $('<option value="' + value + '">' + field + '</option>');
//  option.appendTo($("#transform_column"));
//}




////////////////////

//function associationColumnCreate(obj, table, sourceName, targetName, cb) {
//  obj = {
//    mainTable: '',
//    joinTable: [],
//    columns: [],
//    constraints: []
//  }
//
//  obj.mainTable = table;
//  obj.columns.push({
//    source: sourceName,
//    target: targetName
//  });
//  return cb(null, obj);
//}
//
//function associationColumnAdd(obj, table, columns, constraintKey, constraintReference, constraintType, cb) {
//  for (var i=0; i<obj.columns.length; i++) {
//    for (var j=0; j<columns.length; j++) {
//      if (obj.columns[i].target == columns[j].targetName) {
//        return cb('Column name cannot repeat, already have column name ' + obj.columns[i].target + '!', obj);
//      }
//    }
//  }
//
//  if (table != obj.mainTable) {
//    if (obj.joinTable.indexOf(table) < 0) {
//      obj.joinTable.push(table);
//      obj.constraints.push({
//        key: constraintKey,
//        reference: constraintReference,
//        type: constraintType
//      });
//    } else {
//      for (var i=0; i<obj.constraints.length; i++) {
//        if (obj.constraints[i].key == constraintKey && obj.constraints[i].reference == constraintReference) {
//          if (constraintType == 'outer') {
//            obj.constraints[i].type == 'outer';
//          }
//        }
//      }
//    }
//  }
//
//  for (var i=0; i<columns.length; i++) {
//    obj.columns.push(columns[i]);
//  }
//
//  return cb(null, obj);
//}
//
//function associationColumnDelete(obj, columns, cb) {
//  for (var j=0; j<columns.length; j++) {
//    var table = '';
//    var index;
//    var num = 0;
//
//    for (var i=0; i<obj.columns.length; i++) {
//      if (columns[j].target == obj.columns[i].target) {
//        table = obj.columns[i].source.split('.')[0];
//        index = i;
//      }
//    }
//    if (index > -1) {
//      obj.columns.splice(index, 1);
//    }
//
//    for (var i=0; i<obj.columns.length; i++) {
//      if (table == obj.columns[i].source.split('.')[0]) {
//        num++;
//      }
//    }
//    if (num == 0) {
//      for (var i=0; i<obj.constraints.length; i++) {
//        if (obj.constraints[i].key.split('.')[0] == table) {
//          obj.constraints.splice(i, 1);
//          obj.joinTable.splice(obj.joinTable.indexOf(table), 1);
//        }
//      }
//    }
//  }
//
//  return cb(null, obj);
//}
//
//function transformColumnDelete(obj, columns, cb) {
//  for (var j=0; j<columns.length; j++) {
//    var index = 0;
//
//    for (var i=0; i<obj.columns.length; i++) {
//      if (obj.columns[i].target == columns[j]) {
//        index = i;
//      }
//    }
//    obj.columns.splice(index, 1);
//  }
//
//  return cb(null, obj);
//}

//---- Rule

// --------------------- Rule -------------------------------------

//tinymce.init({ selector:'#ruleAction', height: 500 });
//
//var ruleColumns = [];
//var ruleNum = 0;
//var conditions;
//
//$("#addCondition").click(function () {
//  ruleNum++;
//  rule.addCondition($("#conditions"), ruleColumns, ruleNum);
//});
//
//$("#confirmCondition").click(function () {
//  $("#selectCondition").empty();
//  conditions = rule.parseCondition();
//  var num = 0;
//  for (var key in conditions) {
//    num++;
//    $("#selectCondition").append('<option>Condition' + num + ' : ' + key + '</option>');
//  }
//});
//
//$.ajax({
//  type: 'POST',
//  url: 'db/connection',
//  dataType: 'json',
//  data: {},
//  success: function (response) {
//    if (response.status != "error") {
//      for (var key in response.data) {
//        if (key == 'workflow' + response.workflowId) {
//          for (var i=0; i<response.data[key].columns.length; i++) {
//            ruleColumns.push(response.data[key].columns[i].Field);
//            $("#selectKey").append("<option>" + response.data[key].columns[i].Field + "</option>");
//          }
//        }
//      }
//    }
//  }
//});
//
//$("#insertKey").click(function () {
//  tinymce.activeEditor.execCommand('mceInsertContent', false, '{{' + $("#selectKey").val() + '}}');
//});
//
//$("#insertCondition").click(function () {
//  tinymce.activeEditor.execCommand('mceInsertContent', false, '{{' + $("#selectCondition").val().split(' : ')[1] + ':' + $("#selectBoolean").val() + '} : { Insert condition text here }}');
//});
//
//$("#actionSubmit").click(function () {
//  $.ajax({
//    type: 'POST',
//    url: 'rule/create',
//    dataType: 'json',
//    data: {name: $("#ruleName").val(), condition: JSON.stringify(conditions), action: tinymce.activeEditor.getContent(), schedule: $("#ruleSchedule").val(), description: $("#ruleDescription").val()},
//    success: function (response) {
//      if (response.status == 'success') {
//        alert('success');
//      }
//    }
//  });
//});

// Retrieve current rule

//var testRule;
//
//$.ajax({
//  type: 'GET',
//  url: 'rule/get',
//  dataType: 'json',
//  data: {ruleId: 1},
//  success: function (response) {
//    if (response.status == 'success') {
//      testRule = response.data[0];
//    }
//  }
//});

//$.ajax({
//  type: 'POST',
//  url: 'rule/testRun',
//  dataType: 'json',
//  data: {ruleId: 1},
//  success: function (response) {
//    console.log(response);
//  }
//});


//----------------------------  postgres
//
//$.ajax({
//  type: 'POST',
//  url: 'test/postgres',
//  dataType: 'json',
//  data: {},
//  success: function (response) {
//    console.log(1)
//  }
//});


//------------------------------- LDAP

//$.ajax({
//  type: 'POST',
//  url: 'test/activeDirectory',
//  dataType: 'json',
//  data: {},
//  success: function (response) {
//    console.log(response);
//  }
//});


//list.getStructure('', function (response) {
//
//  list.getData('admindb', 'info', function (response) {
//
//  });
//
//  list.getData('admindb', 'student', function (response) {
//
//  });
//});

//$.ajax({
//  type: 'POST',
//  url: 'test/testEmail',
//  dataType: 'json',
//  data: {},
//  error: function (response) {
//    console.log(JSON.parse(response.responseText).msg);
//  },
//  success: function (response) {
//    console.log(response);
//  }
//});

//$.ajax({
//  type: 'POST',
//  url: 'test/testNotification',
//  dataType: 'json',
//  data: {},
//  error: function (response) {
//    console.log(JSON.parse(response.responseText).msg);
//  },
//  success: function (response) {
//    console.log(response);
//  }
//});

//for (var i=0; i<5; i++) {
//  $.ajax({
//    type: 'POST',
//    url: 'test/testQueue',
//    dataType: 'json',
//    data: {index: i},
//    success: function (response) {
//      console.log(response);
//    }
//  });
//}

//$.ajax({
//  type: 'POST',
//  url: 'test/uploadTable',
//  dataType: 'json',
//  data: {},
//  error: function (response) {
//    console.log(JSON.parse(response.responseText).msg);
//  },
//  success: function (response) {
//    console.log(response);
//  }
//});


$("#ldapjs_button").click(function () {
  if ($("#ldapjs_username").val() && $("#ldapjs_password").val()) {
    $.ajax({
      type: 'POST',
      url: 'test/ldap',
      dataType: 'json',
      data: {username: $("#ldapjs_username").val(), password: $("#ldapjs_password").val()},
      error: function (response) {
        console.log(JSON.parse(response.responseText).msg);
      },
      success: function (response) {
        console.log(response);
      }
    });
  } else {
    alert('Please fill in username and password first.');
  }
});

$("#activeDirectory_button").click(function () {
  if ($("#activeDirectory_username").val() && $("#activeDirectory_password").val()) {
    $.ajax({
      type: 'POST',
      url: 'test/activeDirectory',
      dataType: 'json',
      data: {username: $("#activeDirectory_username").val(), password: $("#activeDirectory_password").val()},
      error: function (response) {
        console.log(JSON.parse(response.responseText).msg);
      },
      success: function (response) {
        console.log(response);
      }
    });
  } else {
    alert('Please fill in username and password first.');
  }
});
