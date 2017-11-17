$(document).ready(function() {

  $(document).ajaxStart(function() {
    var $loading = $(".loading");
    $loading.show();
  })

  $(document).ajaxStop(function() {
    var $loading = $(".loading");
    $loading.hide();
  })

  $('.tabs_data').tabslet({active: 1, mouseevent: 'click', attribute: 'href', animation: true});

  /*----------------nav bar-----------------------*/

  var urlSign = window.location.href.split("/")[3];

  switch (urlSign) {
    case "workflow":
      var $titleList = $("ul.nav li:eq(0)");
      $titleList.addClass("activated");
      break;
    case "data":
      var $titleList = $("ul.nav li:eq(1)");
      $titleList.addClass("activated");
      break;
    case "matrix":
      var $titleList = $("ul.nav li:eq(2)");
      $titleList.addClass("activated");
      break;
    case "action":
      var $titleList = $("ul.nav li:eq(3)");
      $titleList.addClass("activated");
      break;
    case "notification":
      var $titleList = $("ul.nav li:eq(4)");
      $titleList.addClass("activated");
      break;
    default:
  }

  var urlArr = ["/workflow", "/data", "/matrix", "/action", "/notification"];
  for (var i = 0; i < 5; i++) {
    var $list = $("ul.nav li:eq(" + i + ")");
    nav($list, urlArr[i]);
  }
  /*-----------------End nav bar----------------------*/

  /*------------------ grab ontask user info from local storage-----------------*/
  // var onTaskInfo = JSON.parse(window.localStorage.getItem('onTaskInfo'));
  //
  // var $overviewSubHeading = $("#notification-sub-heading");
  // if (onTaskInfo != null) {
  //   $overviewSubHeading.empty();
  //   var div = $("<i class='fa fa-user-circle' aria-hidden='true'></i><span class='name'>" + onTaskInfo.lastName + ',' + onTaskInfo.firstName + "</span>");
  //   $overviewSubHeading.append(div);
  //
  // } else {
  //   console.log("no local strorage");
  //   window.location.href = "/"
  // }

  /*----------------- Retrieve data --------------------------------------------*/

  list.getStructure('', function (response) {
    var db_name = list.workflowDB;
    var table_name = 'workflow' + list.workflowId;
    var tableTemplete = $("<thead><tr></tr></thead><tfoot><tr></tr></tfoot>");
    var $table_id= $("#table_id");
    var columns = [];

    $table_id.empty();
    $table_id.append(tableTemplete);
    console.log(list.data);
    for (var i=0; i<list.data[db_name][table_name].columns.length; i++) {
      $("#table_id thead tr").append('<th>' + list.data[db_name][table_name].columns[i].Field + '</th>');
      $("#table_id tfoot tr").append('<th>' + list.data[db_name][table_name].columns[i].Field + '</th>');
      columns.push(list.data[db_name][table_name].columns[i].Field);
    }

    $('#table_id tfoot th').each( function () {
      var title = $(this).text();
      if (title) {
        $(this).html( '<input type="text" title="' + title + '" placeholder="Search '+title+'" />' );
      }
    });

    var table = $table_id.DataTable({
      "serverSide": true,
      "processing": true,
      "ajax": function ( data, callback, settings ) {
        $.ajax({
          type: 'GET',
          url: 'db/getDataTableData',
          dataType: 'json',
          data: {database: db_name, table: table_name, columns: columns, dataTableData: JSON.stringify(data)},
          error: function (response) {
            checkToken(response);
            console.log(JSON.parse(response.responseText).msg);
            callback({
              data: [],
              recordsTotal: 0,
              recordsFiltered: 0
            });
          },
          success: function (response) {
            callback({
              data: response.data,
              recordsTotal: response.recordsTotal,
              recordsFiltered: response.recordsFiltered
            });
          }
        });
      },
      "initComplete": function () {
        var tempSearchSetTimeout;
        var tempColumnSearchValue;
        table.columns().every( function () {
          var that = this;
          $( 'input', this.footer() ).on( 'keyup change', function (e) {
            clearTimeout(tempSearchSetTimeout);
            tempColumnSearchValue = this.value;
            tempSearchSetTimeout = setTimeout(function () {
              if ( that.search() !== tempColumnSearchValue ) {
                that
                  .search(tempColumnSearchValue)
                  .draw();
              }
            }, 500);
          });
        });
      }
    });

    var dataTableSearchSetTimeout;
    var tempSearchValue;
    $('#table_id_filter input').unbind();
    $('#table_id_filter input').bind('keyup change', function(e) {
      clearTimeout(dataTableSearchSetTimeout);
      tempSearchValue = this.value;
      dataTableSearchSetTimeout = setTimeout(function () {
        table
          .search(tempSearchValue)
          .draw();
      }, 500);
    });
  });

  /*---------------------- draw SVG workflow -----------------------------------*/

  // $.ajax({
  //   type: 'GET',
  //   url: 'rule/getAll',
  //   dataType: 'json',
  //   data: {},
  //   success: function(response) {
  //     if (response.status === "success") {
  //
  //       drawSVG(response.data);
  //
  //     } else {
  //       var defaultData = [
  //         {
  //           "workflow": 1,
  //           "name": "Create new rules",
  //           "description": "Please create new rules",
  //           "schedule": null,
  //           "condition": null,
  //           "action": null,
  //           "data": null,
  //           "id": 1,
  //           "createdAt": null,
  //           "updatedAt": ""
  //         }
  //       ];
  //
  //       drawSVG(defaultData);
  //     }
  //
  //   }
  // });

});

var nav = function(element, url) {
  element.on("click", function() {
    window.location = url;
  });
}

var $dataOverviewLabelImg = $(".indicator-img");
$dataOverviewLabelImg.on("click", function(){

  var $helpModal = $("#help-modal");
  $helpModal.modal();
});

/*--------------------show alert modal---------------------*/
var verifiedModal = function(heading, content){
  var $verifiedModalHeading = $("#verified-modal-heading");
  var $verifiedModalContent = $("#verified-modal-content");

  $verifiedModalHeading.text("");
  $verifiedModalContent.text("");

  $verifiedModalHeading.text(heading);
  $verifiedModalContent.text(content);

  var $verifiedModal = $("#verified-modal");
  $verifiedModal.modal();
};

/*---------------- drawSVG functions ------------------------------*/
var drawSVG = function(data) {
  /*------------------ Set up color schema---------------*/

  var $workflow_red = "#e21b47",
    $workflow_orange = "#ef7e22",
    $workflow_yellow = "#fac70f",
    $workflow_green = "#66a77a",
    $workflow_blue = "#0893c9",
    $workflow_purple = "#8774b3";

  /*------------------ Draw flow chart ------------------*/

  var big_screen_settings = {
    'line-width': 5,
    'line-length': 30,
    'text-margin': 20,
    'font-size': 14,
    'font-color': 'black',
    'line-color': 'black',
    'element-color': 'black',
    'fill': 'white',
    'yes-text': ' ',
    'no-text': ' ',
    'arrow-end': 'block',
    'scale': 1,
    // style symbol types
    'symbols': {
      'start': {
        'font-color': $workflow_red,
        'element-color': 'green',
        'fill': 'yellow',
        'font-size': 20
      },
      'end': {
        'font-color': $workflow_red,
        'element-color': 'green',
        'fill': 'yellow',
        'font-size': 20
      }
    },
    // even flowstate support ;-)
    'flowstate': {
      'dataMangement': {
        'fill': 'white',
        'font-size': 26,
        'font-weight': 'bold',
        'font-color': $workflow_red,
        'element-color': $workflow_red
      },
      'dataInput': {
        'fill': 'white',
        'font-size': 20,
        'font-color': $workflow_red,
        'element-color': $workflow_red
      },
      'matrixView': {
        'fill': 'white',
        'font-size': 26,
        'font-weight': 'bold',
        'font-color': $workflow_orange,
        'element-color': $workflow_orange
      },
      'ruleCoordination': {
        'fill': 'white',
        'font-size': 26,
        'font-weight': 'bold',
        'font-color': $workflow_green,
        'element-color': $workflow_green
      },
      'ruleTitle': {
        'fill': 'white',
        'font-size': 12,
        'font-color': $workflow_green,
        'element-color': $workflow_green
      },
      'ruleSet': {
        'fill': 'white',
        'font-size': 20,
        'font-color': $workflow_green,
        'element-color': $workflow_green
      },
      'ruleAction': {
        'fill': 'white',
        'font-size': 16,
        'font-color': $workflow_green,
        'element-color': $workflow_green
      },
      'summary': {
        'fill': 'white',
        'font-size': 26,
        'font-weight': 'bold',
        'font-color': $workflow_blue,
        'element-color': $workflow_blue
      },
      // 'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
      // 'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
      // 'future' : { 'fill' : '#FFFF99'},
      //'request' : { 'fill' : 'blue'}//,
      // 'invalid': {'fill' : '#444444'},
      // 'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
      // 'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
    }
  };
  var small_screen_settings = {
    'line-width': 5,
    'line-length': 30,
    'text-margin': 20,
    'font-size': 14,
    'font-color': 'black',
    'line-color': 'black',
    'element-color': 'black',
    'fill': 'white',
    'yes-text': ' ',
    'no-text': ' ',
    'arrow-end': 'block',
    'scale': 0.1,
    // style symbol types
    'symbols': {
      'start': {
        'font-color': $workflow_red,
        'element-color': 'green',
        'fill': 'yellow',
        'font-size': 20
      },
      'end': {
        'font-color': $workflow_red,
        'element-color': 'green',
        'fill': 'yellow',
        'font-size': 20
      }
    },
    // even flowstate support ;-)
    'flowstate': {
      'dataMangement': {
        'fill': $workflow_red,
        'font-size': 26,
        'font-weight': 'bold',
        'font-color': 'white',
        'element-color': $workflow_red
      },
      'dataInput': {
        'fill': $workflow_red,
        'font-size': 20,
        'font-color': 'white',
        'element-color': $workflow_red
      },
      'matrixView': {
        'fill': $workflow_orange,
        'font-size': 26,
        'font-weight': 'bold',
        'font-color': 'white',
        'element-color': $workflow_orange
      },
      'ruleCoordination': {
        'fill': $workflow_green,
        'font-size': 26,
        'font-weight': 'bold',
        'font-color': 'white',
        'element-color': $workflow_green
      },
      'ruleTitle': {
        'fill': $workflow_green,
        'font-size': 20,
        'font-color': 'white',
        'element-color': $workflow_green
      },
      'ruleAction': {
        'fill': $workflow_green,
        'font-size': 16,
        'font-color': 'white',
        'element-color': $workflow_green
      },
      'summary': {
        'fill': $workflow_blue,
        'font-size': 26,
        'font-weight': 'bold',
        'font-color': 'white',
        'element-color': $workflow_blue
      },
      // 'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
      // 'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
      // 'future' : { 'fill' : '#FFFF99'},
      //'request' : { 'fill' : 'blue'}//,
      // 'invalid': {'fill' : '#444444'},
      // 'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
      // 'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
    }
  };

  var chart;
  if (chart) {
    chart.clean();
  }

  var createRuleElementPlaceholder = "";
  var createRuleConnectionPlaceholder = "";
  var createRuleConnectOP3 = "op3(right)";

  var length = data.length;
  for (var i = 0; i < length; i++) {
    createRuleElementPlaceholder = createRuleElementPlaceholder + "rule" + i + "=>condition: " + data[i].name + " |ruleTitle\n" + "rule" + i + "run=>subroutine: " + data[i].description + "|ruleAction\n" + "rule" + i + "result=>subroutine: Test run|ruleAction\n";
    if (i === length - 1) {
      createRuleConnectOP3 = createRuleConnectOP3 + "->rule" + i + "\n";
    } else {
      createRuleConnectOP3 = createRuleConnectOP3 + "->rule" + i + "(no)";
    }

    createRuleConnectionPlaceholder = createRuleConnectionPlaceholder + "rule" + i + "(yes)->rule" + i + "run->rule" + i + "result(left)\n";
  }

  var chart = flowchart.parse("st=>start: START\n" +
  "e=>end: END\n" +
  "op1=>operation: Manage My Data|dataMangement:>/data\n" +
  "op2=>operation: Matrix View|matrixView:>/matrix\n" +
  "op3=>operation: Rule Coordination|ruleCoordination:>/action\n" +
  "op4=>operation: Summary|summary\n" +
  "func1=>condition: CSV file|dataInput:>/data?id=2\n" +
  "func2=>condition: Database|dataInput:>/data?id=3\n" +
  "func3=>condition: plugin|dataInput\n" +
  "ruleSet=>condition: Rules Set|ruleSet\n" + createRuleElementPlaceholder + "st->op1\n" + "op1->func1\n" + "func1(yes)->func2(yes)->func3(no)\n" + "func1(no)->op2\n" + "func2(no)->op2\n" + "func3(no)->op2\n" + "op2(right)->op3\n" + createRuleConnectOP3 + createRuleConnectionPlaceholder + "op3->ruleSet(no)->rule0(no)\n" + "ruleSet(yes)->op4\n" + "op4->e\n");

  chart.drawSVG('workflow-small-screen', small_screen_settings);

  /*------------------ End work flow chart drawing ------------------*/

  /*------------------ bind event to zoom button--------------------*/
  var $floatWindowMask = $("#float-window-mask");
  $floatWindowMask.on("click", function() {

    var $workflowBigScreenWrap = $("#workflow-big-screen-wrap");
    var $floatWindowWrap = $("#float-window-wrap");

    $workflowBigScreenWrap.show();
    $floatWindowWrap.hide();

    chart.drawSVG('workflow-big-screen', big_screen_settings);

  });

  var $workflowBigScreenZoomin = $("#workflow-big-screen-zoomin");
  $workflowBigScreenZoomin.on("click", function() {

    var $workflowBigScreenWrap = $("#workflow-big-screen-wrap");
    var $floatWindowWrap = $("#float-window-wrap");

    $workflowBigScreenWrap.hide();
    $floatWindowWrap.show();

    chart.drawSVG('workflow-small-screen', small_screen_settings);

  });

}

/*--------------- Tab 1 event bind ---------------------------------------------*/
var $tab1 = $("ul.horizontal li:nth-child(1)");

$tab1.on("click", function() {});

/*--------------- Tab 2 event bind ---------------------------------------------*/
var $tab2 = $("ul.horizontal li:nth-child(2)");
var currentColumnName = '';

$tab2.on("click", function() {

  /*----------------------- bind event to tab 2---------------------------------*/
  createList("conversion-left-block", tab2CreateDb, tab2CreateTab, tab2CreateColumn, function(message) {
    if (message === "finish") {
      bindToggleEvent();
    } else {}
  });

  $.ajax({
    type: 'GET',
    url: 'workflow/get',
    dataType: 'json',
    data: {},
    error: function (response) {
      checkToken(response);
    },
    success: function(response) {
      if (response.data.transfer) {
        transferObj = JSON.parse(response.data.transfer);
      }
    }
  });

});

var tab2CreateDb = function(id, data) {
  // TODO: add functions
};

var tab2CreateTab = function(id, data) {
  // TODO: add functions
};

var tab2CreateColumn = function(id, data) {
  // TODO: add functions

  var $id = $("#" + id);

  $id.on("click", function() {
    createConversion(data);
    $(".indicator-img").hide();
    $("#convert").show();
  });

  //createConversion(id, data, "table name");
};

var createConversion = function(obj) {

  var $conversionMainLeft = $("#conversion-main-left");
  var $conversionMainRight = $("#conversion-main-right");

  $coversionInstruction = $("#coversion-instruction");
  $coversionInstruction.hide();

  $conversionMainLeft.empty();
  $conversionMainRight.empty();

  var left_ul = $("<ul></ul>");
  $conversionMainLeft.append(left_ul);

  var right_ul = $("<ul></ul>");
  $conversionMainRight.append(right_ul);
  currentColumnName = obj.Field;

  for (var items in obj) {



    switch (items) {
      case "Field":
        var left_li = $("<li><span>" + items + "</span><input type='text' class='btn input-text non-capitalize' value='" + obj[items] + "' readonly='readonly'></li>");
        break;
      case "Type":
        var left_li = $("<li><span>" + items + "</span><input type='text' class='btn input-text non-capitalize' value='" + obj[items] + "' readonly='readonly'></li>");
        break;
      default:

    }

    left_ul.append(left_li);

    switch (items) {
      case "Field":
        var right_li = $("<li style='visibility: hidden'><span>" + items + "</span><input type='text' class='btn input-text' list='keyname_" + items + "' value='"+ obj[items] + "'><datalist id='keyname_" + items + "'></datalist></li>");
        break;
      case "Type":
        var right_li = $("<li><span>" + items + "</span><input type='text' class='btn input-text' list='keyname_" + items + "' placeholder='May need to enter length: eg. varchar(255)'><datalist id='keyname_" + items + "'><option value='TEXT'><option value='VARCHAR(255)'><option value='BINARY'><option value='BOOLEAN'><option value='INTEGER(11)'><option value='FLOAT(8-2)'></datalist></li>");
        break;
      // case "Key":
      //   var right_li = $("<li><span>" + items + "</span><input type='text' class='btn input-text' list='keyname_" + items + "'><datalist id='keyname_" + items + "'><option value='PRIMARY KEY'><option value='UNIQUE'></datalist></li>");
      //   break;
      // case "Default":
      //   var right_li = $("<li><span>" + items + "</span><input type='text' class='btn input-text' list='keyname_" + items + "'><datalist id='keyname_" + items + "'><option value='0'><option value='1'></datalist></li>");
      //   break;
      // case "Extra":
      //   var right_li = $("<li><span>" + items + "</span><input type='text' class='btn input-text' list='keyname_" + items + "'><datalist id='keyname_" + items + "'><option value='AUTO_INCREMENT'></datalist></li>");
      //   break;
      // case "Null":
      //   var right_li = $("<li><span>" + items + "</span><input type='text' class='btn input-text' list='keyname_" + items + "'><datalist id='keyname_" + items + "'><option value='NULL'><option value='NOT NULL'></datalist></li>");
      //   break;

    }

    right_ul.append(right_li);

    var $arrowBox = $("#arrow-box");
    $arrowBox.addClass("arrow_box");

  }

};

/*--------------- Tab 3 event bind ---------------------------------------------*/
var $tab3 = $("ul.horizontal li:nth-child(3)");

var transferObj = {};
$tab3.on("click", function() {

  createMatrixWizardStep(function(message) {
    if (message === "finish") {

      setTimeout(function() {
        var $internalTransformerView = $("#internal-transformer-view");
        $internalTransformerView.steps({
          headerTag: "h3",
          bodyTag: "section",
          transitionEffect: "slideLeft",
          autoFocus: true,
          onFinishing: function(event, currentIndex) {

            if (!$("#transform_new_column_name").val()) {

              verifiedModal("Ontask System", "Please enter new column name.")

            } else {
              var temp = '';
              $("#transform_equation div").each(function() {
                if ($(this).attr('type') == 'column') {
                  temp += 'coalesce(' + $(this).attr('value') + ',0)';
                } else if ($(this).attr('type') == 'operator') {
                  temp += $(this).attr('value');
                } else if ($(this).attr('type') == 'value') {
                  temp += $(this).attr('value');
                }
              });
              if (temp.length > 0) {
                transferObj.columns.push({source: temp, target: $("#transform_new_column_name").val()});
              }

              $.ajax({
                type: 'POST',
                url: 'db/transfer',
                dataType: 'json',
                data: {
                  transferObj: JSON.stringify(transferObj)
                },
                error: function (response) {
                  console.log(JSON.parse(response.responseText).msg);
                  checkToken(response);
                },
                success: function(response) {
                  if (response.status == 'success') {
                    console.log('New column created!');
                    $("#transform_equation").empty();
                    window.location.reload();
                  } else {

                    verifiedModal("OnTask System", response.err);

                  }
                }
              });
            }

            return true;
          }
        });

        $("#transform_column_insert").click(function() {
          $("#transform_equation").append('<div style="display: inline !important;" type="column" value="' + $("#transform_column").val() + '">' + $("#transform_column  option:selected").text() + '</div>');
        });

        $("#transform_operator_insert").click(function() {
          $("#transform_equation").append('<div style="display: inline !important;" type="operator" value="' + $("#transform_operator").val() + '">' + $("#transform_operator").val() + '</div>');
        });

        $("#transform_value_insert").click(function() {
          $("#transform_equation").append('<div style="display: inline !important;" type="value" value="' + $("#transform_value").val() + '">' + $("#transform_value").val() + '</div>');
        });

        $("#transform_clear").click(function() {
          $("#transform_equation").empty();
        });

        $("#transform_confirm").click(function() {
          if (!$("#transform_new_column_name").val()) {
            verifiedModal("OnTask System", "Please enter new column name.");
          } else {
            var temp = '';
            $("#transform_equation div").each(function() {
              if ($(this).attr('type') == 'column') {
                temp += 'coalesce(' + $(this).attr('value') + ',0)';
              } else if ($(this).attr('type') == 'operator') {
                temp += $(this).attr('value');
              } else if ($(this).attr('type') == 'value') {
                temp += $(this).attr('value');
              }
            });
            if (temp.length > 0) {
              transferObj.columns.push({source: temp, target: $("#transform_new_column_name").val()});
            }

            $.ajax({
              type: 'POST',
              url: 'db/transfer',
              dataType: 'json',
              data: {
                transferObj: JSON.stringify(transferObj)
              },
              error: function (response) {
                console.log(JSON.parse(response.responseText).msg);
                checkToken(response);
              },
              success: function(response) {
                if (response.status == 'success') {
                  verifiedModal("OnTask System", 'New column created!');
                  $("#transform_equation").empty();
                  $tab1.click();
                } else {
                  verifiedModal("OnTask System", response.err);
                }
              }
            });
          }
        });
      }, 100);

    }
  });


  list.getStructure('', function(){
    $.ajax({
      type: 'GET',
      url: 'workflow/get',
      dataType: 'json',
      data: {},
      error: function (response) {
        checkToken(response);
      },
      success: function(response) {
        if (response.data.transfer) {
          transferObj = JSON.parse(response.data.transfer);
          var columns = list.data[list.workflowDB]['workflow' + list.workflowId].columns;
          $("#transform_column").empty();
          for (var i = 0; i < transferObj.columns.length; i++) {
            for (var j = 0; j < columns.length; j++) {
              if (transferObj.columns[i].target == columns[j].Field) {
                switch (true) {
                  case(columns[j].Type.indexOf('int') > -1):
                    transformColumnInsert(columns[j].Field, transferObj.columns[i].source);
                    break;
                  case(columns[j].Type.indexOf('decimal') > -1):
                    transformColumnInsert(columns[j].Field, transferObj.columns[i].source);
                    break;
                  case(columns[j].Type.indexOf('float') > -1):
                    transformColumnInsert(columns[j].Field, transferObj.columns[i].source);
                    break;
                  case(columns[j].Type.indexOf('double') > -1):
                    transformColumnInsert(columns[j].Field, transferObj.columns[i].source);
                    break;
                  default:
                    break;
                }
              }
            }
          }
        }
      }
    });
  });

});

var tab3CreateTab = function(id, data) {
  //TODO: insert function
}

var tab3CreateColumn = function(id, data) {
  //TODO: insert function
}

var createMatrixWizardStep = function(callback) {
  var $internalTransformerMain = $("#internal-transformer-main");
  $internalTransformerMain.empty();

  var section = $("<section><h2>&nbsp; Internal transformation tools</h2><div id=\"internal-transformer-view\" class=\"wizard\">" +
  "<h3>Name new column</h3><section><article style=\"margin-left: 50px;\" class=\"action-editor-wrap\">" +
  "<span>Name new column</span><input style=\"border: none;border-bottom: 4px solid #242c42;font-size: 20px;background-color: #eee;\" id=\"transform_new_column_name\" />" +
  "</article></section><h3>Construct new column formula</h3><section><article style=\"margin-left: 50px;\" class=\"action-editor-wrap\">" +
  "<div class=\"grid\"><div class=\"1/3 grid__cell\"><label>Insert column name: </label><br><select id=\"transform_column\"></select><button id=\"transform_column_insert\" class=\"article-btn\"><i class=\"fa fa-arrow-circle-down\" aria-hidden=\"true\"></i></button></div>" +
  "<div class=\"1/3 grid__cell\"><label>Insert operator: </label><br><select id=\"transform_operator\"><option value=\"+\">+</option><option value=\"-\">-</option><option value=\"*\">*</option><option value=\"/\">/</option>" +
  "<option value=\"%\">%</option><option value=\"(\">(</option><option value=\")\">)</option></select><button id=\"transform_operator_insert\" class=\"article-btn\"><i class=\"fa fa-arrow-circle-down\" aria-hidden=\"true\"></i></button></div>" +
  "<div class=\"1/3 grid__cell\"><label>Insert value: </label><br><input style=\"border: none;border-bottom: 4px solid #242c42;font-size: 20px;background-color: #eee;\" id=\"transform_value\" /><button id=\"transform_value_insert\" class=\"article-btn\"><i class=\"fa fa-arrow-circle-down\" aria-hidden=\"true\"></i></button></div></div>" +
  "<div class='internal-transformer-wrap'><label>Formula:</label><div id=\"transform_equation\" style=\"height: 30px; width: 90%; margin-top: 10px;\"></div>" +
  "<button id=\"transform_clear\" class=\"article-btn\"><i class=\"fa fa-trash\" aria-hidden=\"true\"></i><h5>Clear</h5></button>" +
  "<button style=\"display:none;\" id=\"transform_confirm\" class=\"article-btn\"><i class=\"fa fa-check-circle\" aria-hidden=\"true\"></i><h5>Confirm</h5></button></div></article></section>" +
  "</div></section>");

  $internalTransformerMain.append(section);

  return callback("finish");
};

function transformColumnInsert(field, value) {
  var option = $('<option value="' + value + '">' + field + '</option>');
  option.appendTo($("#transform_column"));
}

function viewColumnCreate(obj, table, sourceName, targetName) {
  obj = {
    mainTable: '',
    joinTable: [],
    columns: [],
    constraints: []
  }

  obj.mainTable = table;
  obj.columns.push({source: sourceName, target: targetName});
  return obj;
}

function viewColumnAdd(obj, table, sourceName, targetName, constraintsKey, constraintsReference) {
  for (var i = 0; i < obj.columns.length; i++) {
    if (obj.columns[i].target == targetName) {

      verifiedModal("OnTask System", "Column name cannot repeat!");
      return obj;
    }
  }
  if (table != obj.mainTable && obj.joinTable.indexOf(table) < 0) {
    obj.joinTable.push(table);
    obj.constraints.push({key: constraintsKey, reference: constraintsReference});
  }
  obj.columns.push({source: sourceName, target: targetName});
  return obj;
}

function viewColumnDelete(obj, columnName) {
  var table = '';
  var index = 0;
  var num = 0;

  for (var i = 0; i < obj.columns.length; i++) {
    if (columnName == obj.columns[i].target) {
      table = obj.columns[i].source.split('.')[0];
      index = i;
    }
  }
  obj.columns.splice(index, 1);

  for (var i = 0; i < obj.columns.length; i++) {
    if (table == obj.columns[i].source.split('.')[0]) {
      num++;
    }
  }
  if (num == 0) {
    for (var i = 0; i < obj.constraints.length; i++) {
      if (obj.constraints[i].key.split('.')[0] == table) {
        index = i;
      }
    }
    obj.constraints.splice(index, 1);
  }
  return obj;
}

function matrixViewColumnDelete(obj, columnName) {
  var index = 0;

  for (var i = 0; i < obj.columns.length; i++) {
    if (obj.columns[i].target == columnName) {
      index = i;
    }
  }
  obj.columns.splice(index, 1);
  return obj;
}

/*---------------------- Tab functions -----------------------------------------*/
var createList = function(id, funcDd, funcTab, funcColumn, callback) {

  var $id = $("#" + id);
  $id.empty();

  var db_name = list.workflowDB;
  var table_name = 'workflow' + list.workflowId;

  if (list.data != null) {
    for (var database in list.data) {

      if(database != list.adminDB){
        var ul = $("<ul></ul>");
        $id.append(ul);

        /*------------------------ change show database label name ---------------*/

        var lableLength = 12;

        var li = $("<li class='data-martix-database-icon' id='" + id + "-database-" + database + "'>" + "Matrix" + "</li>");
        ul.append(li);

        var sub_ul = $("<ul></ul>");
        li.append(sub_ul);

        for (var table in list.data[database]) {

          funcDd("" + id + "-database-" + database + "", list.data[database][table]);

          for (var column in list.data[database][table]) {

            if (column === "columns") {

              for (var i = 0; i < list.data[database][table][column].length; i++) {
                if (list.data[database][table][column][i].Field.length > lableLength) {
                  var sub_li = $("<li class='data-column-icon' id='" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "'>" + list.data[database][table][column][i].Field.substring(0, lableLength) + " ... </li>");
                } else {
                  var sub_li = $("<li class='data-column-icon' id='" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "'>" + list.data[database][table][column][i].Field + "</li>");
                }
                sub_ul.append(sub_li);

                //TODO: insert functions;
                funcColumn("" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "",
                list.data[database][table][column][i]);
              }

            } else {}
          }

        }
      }

    }
  } else {
    console.log("list.data is empty, connect to database fails!");
  }

  callback("finish");

}

var bindToggleEvent = function() {

  //$(".directory-list ul > li").unbind("click");

  $(".directory-list ul > li > ul").hide();

  $(".directory-list ul > li").bind("click", function(e) {
    e.stopPropagation();

    $(this).children().toggle(function(e) {
      if (!$(this).is(":visible")) {
        $(this).find("ul").hide();
        $(this).find("sub").show();
      };
    });

    $(this).siblings().each(function(i) {
      if ($(this).children("ul").length > 0) {
        if ($(this).children("ul").css("display").toLowerCase() == "block") {
          $(this).children().toggle(function(e) {
            if (!$(this).is(":visible")) {
              $(this).find("ul").hide();
              $(this).find("sub").show();
            };
          });
        }
      }
    });
  });

  $(".directory-list ul > li").each(function(i) {
    if ($(this).children("ul").length > 0) {
      // $(this).css("cursor", "pointer").prepend($("<sub class='fa fa-plus-square-o' aria-hidden='true'/>").text(""));
      $(this).css("cursor", "pointer").children("ul").before($("<sub class='fa fa-plus-square-o' aria-hidden='true'/>").text(" "));
    } else {
      $(this).css("cursor", "pointer");
    };
  });

}

// -------------------- convert -------------------
$("#convert").click(function() {
  let convertResult = {
    Field: '',
    Type: '',
    Null: '',
    Key: '',
    Default: '',
    Extra: ''
  }

  $("#conversion-main-right input").each(function() {
    convertResult[this.previousSibling.innerHTML] = this.value;
  });

  $.ajax({
    type: 'POST',
    url: 'db/convert',
    dataType: 'json',
    data: {
      originalColumnName: currentColumnName,
      data: convertResult,
      transferObj: JSON.stringify(transferObj)
    },
    error: function(response){
      checkToken(response);
      verifiedModal("Alert", "You are confronting technical error, please contact ontask IT support system");
    },
    success: function(response) {

      verifiedModal("Convert Matrix", "Dear User, your have successfully convert data type.");

      $.ajax({
        type: 'POST',
        url: 'db/connection',
        dataType: 'json',
        data: {},
        error:function(response){
          checkToken(response);
        },
        success: function(response) {

          /* append to left block */

          //var temp = response;
          //
          //for (var key in temp.data) {
          //  if (key.indexOf('workflow' + temp.workflowId) < 0) {
          //    delete temp.data[key];
          //  }
          //}
          //
          //var $conversionLeftBlockItem = $("#conversion-left-block-item");
          //appendLeftBlockTab1($conversionLeftBlockItem, temp);

        }
      });
    }
  });
});

$("#delete").click(function () {
  associationColumnDelete(transferObj, [currentColumnName], function (err, obj) {
    $.ajax({
      type: 'POST',
      url: 'db/transfer',
      dataType: 'json',
      data: {transferObj: JSON.stringify(obj)},
      error: function (response) {
        console.log(JSON.parse(response.responseText).msg);
        checkToken(response);
      },
      success: function (response) {
        window.location.reload();
      }
    });
  });
});

function associationColumnDelete(obj, columns, cb) {
  for (var j=0; j<columns.length; j++) {
    var table = '';
    var indexColumns;
    var indexTable;
    var indexConstraints;
    var num = 0;

    for (var i=0; i<obj.columns.length; i++) {
      if (columns[j] == obj.columns[i].target) {
        table = obj.columns[i].source.split('.')[0];
        indexColumns = i;
      }
    }
    if (indexColumns > -1) {
      obj.columns.splice(indexColumns, 1);
    }

    for (var i=0; i<obj.columns.length; i++) {
      if (table == obj.columns[i].source.split('.')[0]) {
        num++;
      }
    }
    if (num == 0) {
      for (var i=0; i<obj.constraints.length; i++) {
        if (obj.constraints[i].key.split('.')[0] == table) {
          indexConstraints = i;
        }
      }
      if (indexConstraints > -1) {
        obj.constraints.splice(indexConstraints, 1);
      }


      for (var i=0; i<obj.joinTable.length; i++) {
        if (obj.joinTable[i] == table) {
          indexTable = i;
        }
      }
      if (indexTable > -1) {
        obj.joinTable.splice(indexTable, 1);
      }
    }
  }

  return cb(null, obj);
}

// /*----------------------- tab 2 transformer page--------------------------------*/
//
// var $tabTransformer = $("ul.horizontal li:nth-child(2)");
// $tabTransformer.on("click", function() {
//
//   $.ajax({
//     type: 'POST',
//     url: 'db/connection',
//     dataType: 'json',
//     data: {},
//     success: function(response) {
//       /* append to left block */
//       var temp = response;
//
//       for (var key in temp.data) {
//         if (key.indexOf('workflow' + temp.workflowId) < 0) {
//           delete temp.data[key];
//         }
//       }
//
//       var $transformerLeftBlockItem = $("#transformer-left-block-item");
//       appendLeftBlockTab2($transformerLeftBlockItem, temp);
//
//     }
//   });
// });
//
// var appendLeftBlockTab2 = function(element, data) {
//   element.empty();
//
//   var ul = $("<ul></ul>");
//   element.append(ul);
//
//   for (tables in data.data) {
//     var li = $("<li><p><i class='fa fa-table' aria-hidden='true'></i>" +
//     " " + tables + "</p></li>");
//     ul.append(li);
//
//     for (columns in data.data[tables].columns) {
//       var sub_ul = $("<ul id='tab2_conversion_" + tables + "_" + columns + "'><p><i class='fa fa-columns' aria-hidden='true'></i>" + " " + data.data[tables].columns[columns].Field + "</p></ul>");
//       li.append(sub_ul);
//
//       addStringofTransformer("tab2_conversion_" + tables + "_" + columns, data.data[tables].columns[columns].Field);
//     }
//   };
// }
//
// var addStringofTransformer = function(elementId, columnsName) {
//
//   var $element = $("#" + elementId);
//
//   $element.on("click", function() {
//
//     //      var $span = $(".cmd span:nth-child(2)");
//     //      var text = $span.text();
//     //      $span.text(text + " " + columnsName);
//
//   });
//
// }

//-------------------- Matrix Export ------------------------

var datas = {};

$.ajax({
  type: 'POST',
  url: 'matrix/retrieveData',
  dataType: 'json',
  data: {},
  error:function(response){
    checkToken(response);
  },
  success: function(response) {
    console.log(response);
    for (var key in response.data.data[0]) {
      $("#exportColumn").append("<th>" + key + "</th>");
    }
    for (var i = 0; i < response.data.data.length; i++) {
      var tr = $('<tr></tr>');
      for (var key in response.data.data[i]) {
        tr.append('<td>' + response.data.data[i][key] + '</td>');
      }
      $("#exportData").append(tr);
    }
  }
});

$("#matrixExport").click(function() {
  exportFile.export(datas.data, 'file/export', 'csv', function(response, type) {
    var blob = new Blob([response], {type: type});
    var fileName = datas.name + '.csv';
    saveAs(blob, fileName);
  });
});

var $tabExport = $("ul.horizontal li:nth-child(4)");
$tabExport.on("click", function() {
  $('#exportColumn').empty();
  $('#exportData').empty();
  $.ajax({
    type: 'POST',
    url: 'matrix/retrieveData',
    dataType: 'json',
    data: {},
    error:function(response){
      checkToken(response);
    },
    success: function(response) {
      for (var key in response.data.data[0]) {
        $("#exportColumn").append("<th>" + key + "</th>");
      }
      for (var i = 0; i < response.data.data.length; i++) {
        var tr = $('<tr></tr>');
        for (var key in response.data.data[i]) {
          tr.append('<td>' + response.data.data[i][key] + '</td>');
        }
        $("#exportData").append(tr);
      }
    }
  });
});

// ---------------- Tab-5 : Custom Attributes ----------------

var $tab5 = $("ul.horizontal li:nth-child(5)");

var workflowData;
$tab5.on("click", function() {

  list.getStructure('', function(){
    $.ajax({
      type: 'POST',
      url: 'workflow/get',
      dataType: 'json',
      data: {},
      error:function(response){
        checkToken(response);
      },
      success: function(response) {
        if (response.status == 'success') {
          $("#customAttributeArea").empty();
          if (response.data.data) {
            workflowData = JSON.parse(response.data.data);
            if (workflowData.customAttributes) {
              for (var key in workflowData.customAttributes) {
                insertNewAttribute($('#customAttributeArea'), key, workflowData.customAttributes[key]);
              }
            } else {
              workflowData.customAttributes = {};
            }
          } else {
            workflowData = {};
            workflowData.customAttributes = {};
          }
        }
        //console.log(workflowData);
      }
    });
  });
})

$('#customAttributeAdd').click(function() {
  insertNewAttribute($('#customAttributeArea'), '', '');
});

$("#customAttributeConfirm").click(function() {
  var temp = {};

  $('#customAttributeArea .customAttributeContainer').each(function() {
    if ($(this).find('.customAttributeName').val()) {
      temp[$(this).find('.customAttributeName').val()] = $(this).find('.customAttributeValue').val();
    }
  });

  workflowData.customAttributes = temp;

  //TODO: add list
  var $customAttributeList = $("#customAttributeList");
  $customAttributeList.empty();

  var ul = $("<ul></ul>");
  $customAttributeList.append(ul);

  for(var item in workflowData.customAttributes){
    var li = $("<li><span><i class=\"fa fa-address-card\" aria-hidden=\"true\"></i>" + item + "</span><span>|</span><span><i class=\"fa fa-info\" aria-hidden=\"true\"></i>" + workflowData.customAttributes[item] + "</span></li>");
    ul.append(li);
  }

  $.ajax({
    type: 'POST',
    url: 'workflow/update',
    dataType: 'json',
    data: {
      data: JSON.stringify(workflowData)
    },
    error:function(response){
      checkToken(response);
    },
    success: function(response) {
      if (response.status == 'success') {
        verifiedModal("OnTask System", 'Success!');

      }
    }
  });
});

function insertNewAttribute(div, key, value) {

  var $container = $("<div class=\"customAttributeContainer grid\"></div>");
  var $attribute = $("<div class=\"1/3 grid__cell\"><label>Name:</label><br><input class=\"customAttributeName\" /></div>");
  var $value = $("<div class=\"1/3 grid__cell\"><label>Value:</label><br><input class=\"customAttributeValue\" /></div>");
  var $deleteButton = $("<div class=\"1/3 grid__cell\"><button class=\"article-small-btn\"><i class=\"fa fa-trash\" aria-hidden=\"true\"></i></button></div>");

  div.append($container);
  $container.append($attribute);
  $container.append($value);
  $container.append($deleteButton);

  $attribute.find('input').val(key);
  $value.find('input').val(value);

  $deleteButton.click(function() {
    $container.remove();
  });
}

var verifiedModal = function(heading, content){
  var $verifiedModalHeading = $("#verified-modal-heading");
  var $verifiedModalContent = $("#verified-modal-content");

  $verifiedModalHeading.text("");
  $verifiedModalContent.text("");

  $verifiedModalHeading.text(heading);
  $verifiedModalContent.text(content);

  var $verifiedModal = $("#verified-modal");
  $verifiedModal.modal();
};
