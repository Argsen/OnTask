/*----------------- global var--------------------------------------------------*/
var transferObj = {};

/*----------------- nav bar control --------------------------------------------*/
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

  /*----------------nav bar-----------------------------------------------------*/
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
  /*-----------------End nav bar------------------------------------------------*/

  /*------------------------- retrive transferObj when load page----------------*/
  $.ajax({
    type: 'POST',
    url: 'workflow/get',
    dataType: 'json',
    data: {},
    error: function(response){
      checkToken(response);
    },
    success: function(response) {

        if (response.data.transfer) {
          transferObj = JSON.parse(response.data.transfer);

          //console.log(transferObj);
        }
    }
  });

  /*----------------- Retrieve data --------------------------------------------*/
//  list.init('db/connection', ['admindb',''], function(response) {

  list.getStructure('', function (response) {

    /*------------------------- creat tab 1 page left block create----------------*/

    createList("data-overview-left-block",tab1CreateDb, tab1CreateTab, tab1CreateColumn, function(message){
      if(message === "finish"){
        bindToggleEvent();
      }else{

      }
    });

  });

  /*----------------------- bind input [type=file] event -----------------------*/
  var $uploadFile = $("#uploadFile");
  $uploadFile.change(function() {

    var $uploadFileSpan = $("#uploadFileSpan");
    if ($uploadFile.val() === '') {
      console.log("upload file name is null");

    } else {
      $uploadFileSpan.empty();

      var nameArray = $uploadFile.val().split(/\\/);
      var position = nameArray.length;

      $uploadFileSpan.text(nameArray[position - 1]);

      var $uploadSubmit = $("#uploadSubmit");
      $uploadSubmit.click();
    }

  });

  var $uploadFilterFile = $("#uploadFilterFile");
  $uploadFilterFile.change(function() {

    var $uploadFilterFileSpan = $("#uploadFilterFileSpan");
    if ($uploadFilterFile.val() === '') {
      console.log("");

    } else {
      $uploadFilterFileSpan.empty();

      var nameArray = $uploadFilterFile.val().split(/\\/);
      var position = nameArray.length;

      $uploadFilterFileSpan.text(nameArray[position - 1]);
    }

  });

  /*----------------------end bind input [type=file] event----------------------*/

  // /*------------------ grab ontask user info from local storage-----------------*/
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

  /*---------------------- draw SVG workflow -----------------------------------*/

  // $.ajax({
  //   type: 'GET',
  //   url: 'rule/getAll',
  //   dataType: 'json',
  //   data: {},
  //   success: function (response) {
  //     if(response.status === "success"){
  //
  //       drawSVG(response.data);
  //
  //     }else{
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
  //   }
  // });

  /*--------------------bind clear screen button--------------------------------*/
  // var $dataClearButton = $("#data-clear-button");
  // $dataClearButton.on("click", function(){
  //   var $ontaskDiagram = $("#ontaskDiagram");
  //   $ontaskDiagram.empty();
  // });

  $('.tooltip').tooltipster({
    theme: 'tooltipster-noir'
  });

  var $dataOverviewLabelImg = $("#data-overview-label img");
  $dataOverviewLabelImg.on("click", function(){

    var $helpModal = $("#help-modal");
    $helpModal.modal();
  });


});

/*--------------------- navigation funcitons -----------------------------------*/
var nav = function(element, url) {
  element.on("click", function() {
    window.location = url;
  });
}

/*---------------- drawSVG functions ------------------------------*/
var drawSVG = function(data){
  /*------------------ Set up color schema---------------*/

  var $workflow_red = "#e21b47",
      $workflow_orange = "#ef7e22",
      $workflow_yellow = "#fac70f",
      $workflow_green = "#66a77a",
      $workflow_blue = "#0893c9",
      $workflow_purple = "#8774b3";


  /*------------------ Draw flow chart ------------------*/

  var big_screen_settings= {
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
          'font-size' : 20
        },
        'end':{
          'font-color': $workflow_red,
          'element-color': 'green',
          'fill': 'yellow',
          'font-size' : 20
        }
    },
    // even flowstate support ;-)
    'flowstate' : {
        'dataMangement' : {'fill': 'white' , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_red , 'element-color' : $workflow_red },
        'dataInput' : {'fill': 'white' , 'font-size' : 20, 'font-color' : $workflow_red , 'element-color' : $workflow_red},
        'matrixView' : {'fill': 'white' , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_orange , 'element-color' : $workflow_orange},
        'ruleCoordination' : {'fill': 'white', 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_green , 'element-color' : $workflow_green},
        'ruleTitle' : {'fill': 'white' , 'font-size' : 12, 'font-color' : $workflow_green, 'element-color' : $workflow_green},
        'ruleSet' : {'fill': 'white' , 'font-size' : 20, 'font-color' : $workflow_green, 'element-color' : $workflow_green},
        'ruleAction' : {'fill': 'white' , 'font-size' : 16, 'font-color' : $workflow_green, 'element-color' : $workflow_green},
        'summary' : {'fill': 'white' , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_blue , 'element-color' : $workflow_blue},
        // 'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
        // 'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
        // 'future' : { 'fill' : '#FFFF99'},
        //'request' : { 'fill' : 'blue'}//,
        // 'invalid': {'fill' : '#444444'},
        // 'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
        // 'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
      }
  };
  var small_screen_settings ={
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
          'font-size' : 20
        },
        'end':{
          'font-color': $workflow_red,
          'element-color': 'green',
          'fill': 'yellow',
          'font-size' : 20
        }
    },
    // even flowstate support ;-)
    'flowstate' : {
        'dataMangement' : {'fill': $workflow_red  , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_red },
        'dataInput' : {'fill': $workflow_red , 'font-size' : 20, 'font-color' : 'white' , 'element-color' : $workflow_red},
        'matrixView' : {'fill': $workflow_orange  , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_orange},
        'ruleCoordination' : {'fill': $workflow_green, 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_green},
        'ruleTitle' : {'fill': $workflow_green , 'font-size' : 20, 'font-color' : 'white', 'element-color' : $workflow_green},
        'ruleAction' : {'fill': $workflow_green , 'font-size' : 16, 'font-color' : 'white', 'element-color' : $workflow_green},
        'summary' : {'fill': $workflow_blue, 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_blue},
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
  var createRuleConnectOP3 ="op3(right)";

  var length = data.length;
  for(var i=0;i<length; i++){
    createRuleElementPlaceholder = createRuleElementPlaceholder + "rule" + i + "=>condition: " + data[i].name + " |ruleTitle\n"
                                   + "rule" + i + "run=>subroutine: " + data[i].description + "|ruleAction\n"
                                   + "rule" + i + "result=>subroutine: Test run|ruleAction\n";
    if(i === length - 1){
      createRuleConnectOP3 = createRuleConnectOP3 + "->rule" + i + "\n";
    }else{
      createRuleConnectOP3 = createRuleConnectOP3 + "->rule" + i + "(no)";
    }

    createRuleConnectionPlaceholder = createRuleConnectionPlaceholder + "rule" + i + "(yes)->rule" + i + "run->rule" + i + "result(left)\n";
  }

  var chart = flowchart.parse(
        "st=>start: START\n"
        + "e=>end: END\n"
        + "op1=>operation: Manage My Data|dataMangement:>/data\n"
        + "op2=>operation: Matrix View|matrixView:>/matrix\n"
        + "op3=>operation: Rule Coordination|ruleCoordination:>/action\n"
        + "op4=>operation: Summary|summary\n"
        + "func1=>condition: CSV file|dataInput:>/data?id=2\n"
        + "func2=>condition: Database|dataInput:>/data?id=3\n"
        + "func3=>condition: plugin|dataInput\n"
        + "ruleSet=>condition: Rules Set|ruleSet\n"
        + createRuleElementPlaceholder
        + "st->op1\n"
        + "op1->func1\n"
        + "func1(yes)->func2(yes)->func3(no)\n"
        + "func1(no)->op2\n"
        + "func2(no)->op2\n"
        + "func3(no)->op2\n"
        + "op2(right)->op3\n"
        + createRuleConnectOP3
        + createRuleConnectionPlaceholder
        + "op3->ruleSet(no)->rule0(no)\n"
        + "ruleSet(yes)->op4\n"
        + "op4->e\n");

  chart.drawSVG('workflow-small-screen', small_screen_settings);

  /*------------------ End work flow chart drawing ------------------*/

  /*------------------ bind event to zoom button--------------------*/
  var $floatWindowMask = $("#float-window-mask");
  $floatWindowMask.on("click", function(){

    var $workflowBigScreenWrap =$("#workflow-big-screen-wrap");
    var $floatWindowWrap =$("#float-window-wrap");

    $workflowBigScreenWrap.show();
    $floatWindowWrap.hide();

    chart.drawSVG('workflow-big-screen', big_screen_settings);

  });

  var $workflowBigScreenZoomin =$("#workflow-big-screen-zoomin");
  $workflowBigScreenZoomin.on("click", function(){

    var $workflowBigScreenWrap =$("#workflow-big-screen-wrap");
    var $floatWindowWrap =$("#float-window-wrap");

    $workflowBigScreenWrap.hide();
    $floatWindowWrap.show();

    chart.drawSVG('workflow-small-screen', small_screen_settings);

  });

}

/*--------------- Tab 1 event bind ---------------------------------------------*/
var $tab1 = $("ul.horizontal li:nth-child(1)");

$tab1.on("click", function() {

  createList("data-overview-left-block", tab1CreateDb , tab1CreateTab, tab1CreateColumn, function(message) {
    if (message === "finish") {
      bindToggleEvent();
    } else {}
  });

});


var tempID =[];

var tab1CreateDb = function(id, data){
  //clickItem(id, data, "1");
  clickItemShowDetails(id, data);
}

var tab1CreateTab = function(id, data){
   // TODO: add functions
   //clickItem(id, data, "0");
   clickItemShowDetails(id, data);
};

var tab1CreateColumn = function(id, data){
  // TODO: add functions
};

/*--------------------------databse diagram-----------------------------------*/

var clickItem = function(elementId, data, trigger) {

  var $element = $("#" + elementId);
  $element.on("click", function() {
    switch (trigger) {
      case "0":
        var tableNameArr = elementId.split("-table-");
        var tableName = tableNameArr[tableNameArr.length - 1];
        insertDiagram(tableName, data);
        break;
      case "1":
        var tableName = "My Data";
        insertDiagram(tableName, data);
        break;
      default:

    }

  });

};

var insertDiagram = function(columnName, data) {

  // console.log(data);
  var $ontaskDiagram = $("#ontaskDiagram");
  // $ontaskDiagram.empty();

  var div = $("<div class='ent' id='" + columnName + "'>" + columnName + "</div>");
  $ontaskDiagram.append(div);

  var ul_pk = $("<ul class='pk'></ul>");
  var ul_cols = $("<ul class='cols'></ul>");
  div.append(ul_pk);
  div.append(ul_cols);

  for (var columns in data.columns) {

    var li = $("<li><i class='fa fa-columns' aria-hidden='true'></i>" + data.columns[columns].Field + "</li>");

    //TODO: use different color to identify columns
    if (data.columns[columns].Field === 'id') {
      ul_pk.append(li);
    } else {
      ul_cols.append(li);
    }

  }

  $(".ent").draggable({containment: 'body', scroll: false});

  var lmb = false;

  $(".ent").mousedown(function(e) {
    if (e.which === 1)
      lmb = true;
    }
  );

  $(".ent").mouseup(function(e) {
    if (e.which === 1)
      lmb = false;
    }
  );

  $(".ent").mousemove(function(e) {
    if (e.which === 1 && lmb) {
      calculate();
    }
  });

  var calculate = function() {

    $(".ent").each(function() {
      var ent = $(this);
      if ($(this).children(".fk").length != 0) {
        $(this).children(".fk").children("li").each(function() {
          var tbName = $(this).attr("fk");
          var rt = $("#" + tbName);

          if ($("#rel" + tbName).length == 0) {
            var rel = $("<div class='rel'></div>");
            rel.attr("id", "rel" + tbName)
          } else
            var rel = $("#rel" + tbName);

          var sx = ent.offset().left + Math.round(ent.outerWidth() / 2);
          var sy = ent.offset().top + Math.round(ent.outerHeight() / 2);
          var ex = rt.offset().left + Math.round(rt.outerWidth() / 2);
          var ey = rt.offset().top + Math.round(rt.outerHeight() / 2);

          var t,
            l;
          if (sy > ey)
            t = ey;
          else
            t = sy;
          if (sx > ex) {
            l = ex;
          } else {
            l = sx;
          }

          var cx = sx - ex;
          var cy = sy - ey;
          if ((cx >= 0) && (cy >= 0)) {
            rel.toggleClass("relRT", true);
            rel.toggleClass("relLB relRB relLT", false);
          } else if ((cx > 0) && (cy < 0)) {
            rel.toggleClass("relRB", true);
            rel.toggleClass("relLB relLT relRT", false);
          } else if ((cx < 0) && (cy > 0)) {
            rel.toggleClass("relLT", true);
            rel.toggleClass("relLB relRT relRB", false);
          } else if ((cx < 0) && (cy < 0)) {
            rel.toggleClass("relLB", true);
            rel.toggleClass("relLT relRT relRB", false);
          }

          rel.offset({top: t, left: l});
          rel.height(Math.abs(ey - sy));
          rel.width(Math.abs(ex - sx));

          $("body").append(rel);
        });
      }
    });
  }

  calculate();
}

/*-------------------------show table details ----------------------------------*/

var clickItemShowDetails = function(elementId, data){
  var $element = $("#" + elementId);
  $element.on("click", function() {

    var length = elementId.split("-").length;
    if(elementId.split("-")[length -1] === list.workflowDB){

      showDetails(list.workflowDB, 'workflow' + list.workflowId);

      //list.getData('user' + list.userId, 'workflow' + list.workflowId, function (response) {
      //
      //  var schema = list.data['user' + list.userId]['workflow' + list.workflowId];
      //  showDetails(schema, response);
      //
      //});
    }else{
      var table = elementId.split("-table-")[1];
      var database = elementId.split("-table-")[0].split("-database-")[1];

      showDetails(database, table);

      //list.getData(database, table, function (response) {
      //
      //  var schema = list.data[database][table];
      //  showDetails(schema, response);
      //
      //});

    }


  });
}

var showDetails = function(database, table){
  var $dataOverviewLabel =$("#data-overview-label");
  $dataOverviewLabel.hide();

  // var div = $("<div class=''><table class='data-table'><thead id='data-overview-heading'></thead><tbody id='data-overview-table'></tbody></table></div>");
  // $dataOverviewPreview.append(div);
  //
  // var tr = $("<tr></tr>");
  // var $dataOverviewHeading = $("#data-overview-heading");
  // $dataOverviewHeading.append(tr);
  //
  // var sequenceArr = [];
  //
  // for (var i = 0; i < data.columns.length; i++) {
  //
  //   // if (data.columns[i].Field != "id") {
  //     var td = $("<td>" + data.columns[i].Field + "</td>");
  //     tr.append(td);
  //     sequenceArr.push(data.columns[i].Field);
  //   // }
  //
  // }
  //
  // var $dataOverviewTable = $("#data-overview-table");
  //
  // if(data.data.length < 13){
  //
  //   for (var item in data.data) {
  //
  //     var content_tr = $("<tr></tr>");
  //     $dataOverviewTable.append(content_tr);
  //
  //     for (var i = 0; i < sequenceArr.length; i++) {
  //       for (var name in data.data[item]) {
  //         if (sequenceArr[i] === name) {
  //
  //           /*--------------- Insert table with corret order -------------------*/
  //           if(data.data[item][name] === null){
  //             var content_td = $("<td>" + " " + "</td>")
  //             content_tr.append(content_td);
  //           }else{
  //             var content_td = $("<td>" + data.data[item][name] + "</td>")
  //             content_tr.append(content_td);
  //           }
  //
  //         }
  //       }
  //     }
  //   }
  //
  //   /*--------- filling the empty -----------*/
  //
  //   for(var j=0; j< (13- data.data.length); j++ ){
  //     var empty_tr = $("<tr></tr>");
  //     $dataOverviewTable.append(empty_tr);
  //
  //     for (var i = 0; i < sequenceArr.length; i++) {
  //
  //       var empty_td = $("<td>" + "&nbsp;" + "</td>")
  //       empty_tr.append(empty_td);
  //
  //     }
  //
  //   }
  //
  //
  //
  //
  // }else{
  //   for (var item in data.data) {
  //
  //     var content_tr = $("<tr></tr>");
  //     $dataOverviewTable.append(content_tr);
  //
  //     for (var i = 0; i < sequenceArr.length; i++) {
  //       for (var name in data.data[item]) {
  //         if (sequenceArr[i] === name) {
  //
  //           /*--------------- Insert table with corret order -------------------*/
  //           if(data.data[item][name] === null){
  //             var content_td = $("<td>" + " " + "</td>")
  //             content_tr.append(content_td);
  //           }else{
  //             var content_td = $("<td>" + data.data[item][name] + "</td>")
  //             content_tr.append(content_td);
  //           }
  //
  //         }
  //       }
  //     }
  //   }
  // }

  var tableTemplete = $("<table id=\"table_id\" class=\"display\"><thead><tr></tr></thead><tfoot><tr></tr></tfoot></table>");
  var columns = [];

  $("#table_id_wrapper").remove();
  $(".data-overview").append(tableTemplete);

  for (var i=0; i<list.data[database][table].columns.length; i++) {
    $("#table_id thead tr").append('<th>' + list.data[database][table].columns[i].Field + '</th>');
    $("#table_id tfoot tr").append('<th>' + list.data[database][table].columns[i].Field + '</th>');
    columns.push(list.data[database][table].columns[i].Field);
  }

  $('#table_id tfoot th').each( function () {
    var title = $(this).text();
    if (title) {
      $(this).html( '<input type="text" title="' + title + '" placeholder="Search '+title+'" />' );
    }
  });

  var dataTable = $("#table_id").DataTable({
    "serverSide": true,
    "processing": true,
    "ajax": function ( data, callback, settings ) {
      $.ajax({
        type: 'GET',
        url: 'db/getDataTableData',
        dataType: 'json',
        data: {database: database, table: table, columns: columns, dataTableData: JSON.stringify(data)},
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
      dataTable.columns().every( function () {
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
      dataTable
        .search(tempSearchValue)
        .draw();
    }, 500);
  });
};

/*--------------- Tab 2 event bind ---------------------------------------------*/
var $tab2 = $("ul.horizontal li:nth-child(2)");

$tab2.on("click", function() {

  createList("fileUpload-overview-left-block",function(){}, tab2CreateTab, tab2CreateColumn, function(message){
    if(message === "finish"){
      bindToggleEvent();
    }else{

    }
  });

});

var tab2CreateTab = function(id, data){
 // TODO: add functions
};

var tab2CreateColumn = function(id, data){
  // TODO: add functions
};

  /*-------------- CSV Upload && create csv table into user database -----------*/
var tempData = new Object(); // temp store csv files data

$("#uploadSubmit").click(function(e) {
  e.preventDefault();

  var type = $("#uploadFile").val().split('.')[$("#uploadFile").val().split('.').length - 1];

  uploadFile.upload($('#uploadForm'), 'file/upload', type, function(response) {
    if (response.status == 'success') {
      var $fileUploadPreview = $("#file-upload-preview");
      $fileUploadPreview.empty();

      var head = $("<div class='data-table-wrap'><table class='data-table'><thead><tr><th>Unique</th><th>Column Name</th><th>Rename</th></tr></thead><tbody id='csv-table'></tbody></table></div>");
      $fileUploadPreview.append(head);

      var $table = $("#csv-table");
      $table.empty();

      for (var i = 0; i < response.data.length; i++) {
        insertCSVAttribute(response.data[i], i);
      }

      setTimeout(function(){
        $(":checkbox").on("click", function(){
          window.scrollTo(0, 0);
        })
      }, 2000)

      tempData = response;
    }
  });
});

var insertCSVAttribute = function(data, index) {

  var $table = $("#csv-table");

  var td = $("<tr><td><div class='field'><input type='checkbox' name='csvupload' value='' id='checkbox1_" + data + "' /><label class='checkbox' for='checkbox1_" + data + "'></label></div></td><td>" + data + "</td><td><input type='text' class='btn input-text' value='" + data + "' id='input_" + index + "' /></td></tr>");

  $table.append(td);

}

var $uploadCSV = $("#uploadCSV");
$uploadCSV.on("click", function() {
  for (var i = 0; i < tempData.data.length; i++) {
    var $inputValue = $("#input_" + i);
    tempData.data[i] = $inputValue.val();
  }

  $.ajax({
    type: 'POST',
    url: 'db/uploadTable',
    dataType: 'json',
    data: {
      name: $('#uploadFile')[0].files[0].name.replace('.', '_'),
      data: tempData.data,
      path: tempData.path,
    // todo: add unique columns as an array to uploadTable function
    //  unique: []
    },
    error:function(response){
      checkToken(response);
      console.log(JSON.parse(response.responseText).msg);
    },
    success: function(response) {
      if (response.status == 'error') {
        alert(response.data);
      } else {
        //list.init('db/connection', ['admindb'], function (response) {
        list.getStructure('', function (response) {

          var $fileUploadOverviewLeftBlock = $("#fileUpload-overview-left-block");
          $fileUploadOverviewLeftBlock.empty();

          createList("fileUpload-overview-left-block",function(){}, tab2CreateTab, tab2CreateColumn, function(message){
            if(message === "finish"){
              bindToggleEvent();
            }else{

            }
          });

          //TODO: show success modal
          var $successModal = $("#successModal");
          var $confirmUpload = $("#confirm-upload");
          $successModal.modal();
          $confirmUpload.on("click", function(){
            $.modal.close();
          });
        });

        window.location.href = "/data";
      }
    }
  });

//  $('#uploadFile').val('');
});


/*-------------- Tab 6 event bind ----------------------------------------------*/
var $tab6 = $("ul.horizontal li:nth-child(6)");

$tab6.on("click", function(){

  createList("data-association-left-block",function(){}, tab6CreateTab, tab6CreateColumn, function(message) {

    if (message === "finish") {
      bindToggleEvent();
    } else {}

  });

  createDataWizardStep(function(message){
    switch (message) {
      case "step1":

        setTimeout(function(){

          var $PKTable = $("#PK-table");
          var $PKColumn = $("#PK-column");

          /*------------- create main table: step 1-----------------------*/

          insertOptions($PKTable, $PKColumn);

          $PKTable.on("change click", function() {
            var $errorMessage = $("#error-message");
            $errorMessage.hide();
          });


        }, 200)

        /*-------------------------- no workflow exist, create new workflow ------------*/
        $("#create-view").steps({
          headerTag: "h3",
          bodyTag: "section",
          transitionEffect: "slideLeft",
          autoFocus: true,
          onStepChanging: function(event, currentIndex, newIndex) {

            switch (currentIndex) {

              case 0:
                var $PKTable = $("#PK-table");
                var $PKColumn = $("#PK-column");

                var $errorMessage = $("#error-message");
                $errorMessage.hide();

                if ($PKTable.val() == null || $PKColumn.val() == null) {
                  $errorMessage.show();
                  return false
                } else {

                  var $step1Id = $("#step-1-id");
                  $step1Id.val($PKColumn.val());

                  return true
                };

                break;
              case 1:

                var $dataAssociationStep1Final = $("#data-association-step-1-final");
                var $PKTable = $("#PK-table");
                var $PKColumn = $("#PK-column");

                $dataAssociationStep1Final.empty();
                var p = $("<p>You have selected to copy - Table <strong>" + $PKTable.val() + "</strong> column: <strong>" + $PKColumn.val() + " </strong> as the primary key in Matrix Data.</p>");
                $dataAssociationStep1Final.append(p);
                return true
                break;
              default:
                return true

            }

          },
          onFinishing: function(event, currentIndex) {
            //console.log("finish button clicked!");
            var $PKTable = $("#PK-table");
            var $PKColumn = $("#PK-column");
            var $step1Id = $("#step-1-id");

            associationColumnCreate(transferObj, $PKTable.val(), $PKTable.val() + '.' + $PKColumn.val(), $step1Id.val(), function (err, obj) {
              if (err) {
                alert(err)
              } else {
                $.ajax({
                  type: 'POST',
                  url: 'db/transfer',
                  dataType: 'json',
                  data: {transferObj: JSON.stringify(obj)},
                  error:function(response){
                    checkToken(response);
                  },
                  success: function (response) {
                    var $successAjaxModal = $("#success-Ajax-Modal");
                    $successAjaxModal.modal();

                    var $confirmSuccess = $("#confirm-success");
                    $confirmSuccess.on("click", function(){
                      $.modal.close();
                      window.location.href = "/data?id=5";
                    });
                  }
                });
              }
            });

            return true;
          }
        });

        break;
      case "step2":

        setTimeout(function(){
          /*----------------add more data: step 2----------------------*/
          var $addTable = $("#add-table");
          var $addColumn = $("#add-column");
          var $addConstraintsRename = $("#add-constraints-rename");
          var $errorMessage = $("#error-message-2");

          InsertTableInfo($addTable, $addColumn, $addConstraintsRename, $errorMessage);

          InsertColumnInfo($addTable, $addColumn, $addConstraintsRename, $errorMessage);

          /*---------------bind event to step 2---------------*/
          var $dataAssociationStep2AddColumn = $("#data-association-step-2-add-column");
          $dataAssociationStep2AddColumn.on("click", function(){

            var $addTable = $("#add-table");
            var $addColumn = $("#add-column");
            var $addConstraintsRename = $("#add-constraints-rename");

            var $ul = $("#column-placeholder ul");
            var li = $("<li><div class=\"grid\"><div class=\"1/3 grid__cell\"></div>"
                        +"<div class=\"1/3 grid__cell\"><h5>&nbsp; Select column</h5><select></select></div>"
                        +"<div class=\"1/3 grid__cell\"><h5>&nbsp; Target column name:</h5><input class=\"text-input\" type=\"text\"></div></div></li>");
            $ul.append(li);

            setTimeout(function(){
              var $select = $(".column-placeholder ul li:last-child select");
              var $input = $(".column-placeholder ul li:last-child input");

              for (var table in list.data[list.adminDB]) {

                if(table === $addTable.val()){
                  for (var column in list.data[list.adminDB][table].columns) {
                    var column_option = $("<option>" + list.data[list.adminDB][table].columns[column].Field + "</option>");
                    $select.append(column_option);
                    $input.val(list.data[list.adminDB][table].columns[column].Field);
                  }
                }

              }

              InsertColumnInfo($addTable, $select, $input);

            },100);

          });

          var $dataAssociationStep2RemoveColumn = $("#data-association-step-2-remove-column");
          $dataAssociationStep2RemoveColumn.on("click", function(){
            var $li = $(".column-placeholder ul li:last-child")
            $li.remove();
          });

          /*---------------bind event to step 2---------------*/
        },100);

        /*------------------------- if has workflow, add more workflow------------------*/
        $("#add-view").steps({
          headerTag: "h3",
          bodyTag: "section",
          transitionEffect: "slideLeft",
          autoFocus: true,
          onStepChanging: function(event, currentIndex, newIndex) {

            switch (currentIndex) {
              case 0:
                var $addTable = $("#add-table");
                var $addColumn = $("#add-column");
                var $addConstraintsRename = $("#add-constraints-rename");

                var $list = $("#column-placeholder ul").find("select");

                var Arr1 = [];
                var Arr2 = [];

                Arr1.push($addColumn.val());
                Arr2.push($addColumn.val());

                $list.each(function() {
                  Arr1.push($(this).val());
                  Arr2.push($addColumn.val());
                });

                var columnError = false;
                var columns = [$addConstraintsRename.val()];
                var $li = $("#column-placeholder li");

                $li.each(function(){
                  var input = $(this).find("input").val();
                  if (!input) {
                    columnError = true;
                  }
                  columns.push(input);
                });

                for (var i=0; i<columns.length; i++) {
                  for (var j=0; j<transferObj.columns.length; j++) {
                    if (columns[i] == transferObj.columns[j].target) {
                      columnError = true;
                      break;
                    }
                  }
                }

                if (($addTable.val() === '' || $addColumn.val() === '' || $addConstraintsRename.val() === '' || columnError || $.unique(Arr1).length < Arr2.length) && newIndex > currentIndex) {
                  var $errorMessage2 = $("#error-message-2");
                  $errorMessage2.show();

                  return false
                } else {

                  var $addTable = $("#add-table");
                  var $addColumn = $("#add-column");

                  /*-------------judge if this is main table to show constraints----------*/
                  var $addConstraintsWrap1 = $("#add-constraints-wrap-1");
                  var $addConstraintsWrap2 = $("#add-constraints-wrap-2");

                  if (transferObj.mainTable === $addTable.val()) {
                    //console.log("The same with main table, do not show constrants");
                    $addConstraintsWrap1.hide();
                    $addConstraintsWrap2.show();
                  } else {
                  //console.log("show constarants blocks");
                  $addConstraintsWrap2.hide();
                  $addConstraintsWrap1.show();

                  //TODO: add function to constraints functions
                  var $addConstraintsMainTable = $("#add-constraints-main-table");
                  var $addConstraintsMainColumn = $("#add-constraints-main-column");

                  var $addConstraintsReferenceTable = $("#add-constraints-reference-table");
                  var $addConstraintsReferenceColumn = $("#add-constraints-reference-column");

                  insertConstraints($addTable.val(), $addConstraintsMainTable, $addConstraintsMainColumn, $addConstraintsReferenceTable, $addConstraintsReferenceColumn);

                  // insertOptions($addConstraintsMainTable, $addConstraintsMainColumn);
                  // insertOptions($addConstraintsReferenceTable, $addConstraintsReferenceColumn);
                }

                  var $errorMessage = $("#error-message-2");
                  if($errorMessage){
                    $errorMessage.hide();
                  }

                  return true
                }

                break;

              case 1:
                var $addTable = $("#add-table");
                var $addColumn = $("#add-column");

                var $dataAssociationStep2Final = $("#data-association-step-2-final");
                $dataAssociationStep2Final.empty();

                var p = $('<p></p>');
              //  var p = $("<p>Are you sure to add Table: <strong>" + $addTable.val() + "</strong> to your workflow?</p>");
                $dataAssociationStep2Final.append(p);

                /*-------------------judge if empty-------------------------------------*/
                var $addConstraintsMainTable = $("#add-constraints-main-table");
                var $addConstraintsMainColumn = $("#add-constraints-main-column");

                var $addConstraintsReferenceTable = $("#add-constraints-reference-table");
                var $addConstraintsReferenceColumn = $("#add-constraints-reference-column");

                if(transferObj.mainTable === $addTable.val()){

                  return true

                }else{
                  if(($addConstraintsMainTable.val() === null || $addConstraintsMainColumn.val() === null || $addConstraintsReferenceTable.val() === null || $addConstraintsReferenceColumn.val() === null) && newIndex > currentIndex){
                    var $errorMessage3 = $("#error-message-3");
                    $errorMessage3.show();

                    return false
                  }else{
                    var $errorMessage3 = $("#error-message-3");
                    $errorMessage3.hide();
                    return true
                  }
                }

                break
              default:
                return true
            }

          },
          onFinishing: function(event, currentIndex) {

            var $addTable = $("#add-table");
            var $addColumn = $("#add-column");
            var $addConstraintsRename = $("#add-constraints-rename");

            var $addConstraintsMainTable = $("#add-constraints-main-table");
            var $addConstraintsMainColumn = $("#add-constraints-main-column");

            var $addConstraintsReferenceTable = $("#add-constraints-reference-table");
            var $addConstraintsReferenceColumn = $("#add-constraints-reference-column");


            /*-------------------structure send dataset ------------------------*/
            var columns = [
              {
                source: $addTable.val() + "." + $addColumn.val(),
                target: $addConstraintsRename.val(),
              }
            ];

            var $li = $("#column-placeholder li");

            $li.each(function(){
              var select = $(this).find("select").val();
              var input = $(this).find("input").val();
              var dataCell = {
                source: $addTable.val() + "." + select,
                target: input
              };
              columns.push(dataCell);
            });

            /*------------------ traversing to retrieve reference---------------*/
            var constraintReference = '';
            for(var item in  transferObj.columns){
              if(transferObj.columns[item].target === $addConstraintsReferenceColumn.val()){
                constraintReference = transferObj.columns[item].source;
              }
            }

            /*------------------ submit to transferObj----------------------------------*/
            var $dataModel = $("#data-model");

            if(transferObj.mainTable === $addTable.val()){
              /*---------------no constraints-----------------------------------*/

              switch ($dataModel.val()) {
                case "Expand (Right join)":
                  associationColumnAdd(transferObj, $addTable.val(), columns, '', '', 'outer', function (err, obj) {
                    if (err) {
                      alert(err)
                    } else {
                      $.ajax({
                        type: 'POST',
                        url: 'db/transfer',
                        dataType: 'json',
                        data: {transferObj: JSON.stringify(obj)},
                        error:function(response){
                          checkToken(response);
                        },
                        success: function (response) {

                          var $successAjaxModal = $("#success-Ajax-Modal");
                          $successAjaxModal.modal();

                          var $confirmSuccess = $("#confirm-success");
                          $confirmSuccess.on("click", function(){
                            $.modal.close();
                            window.location.href = '/data?id=5';
                          });
                        }
                      });
                    }
                  });
                  break;
                case "Drop (Default - left join)":
                  associationColumnAdd(transferObj, $addTable.val(), columns, '', '', 'inner', function (err, obj) {
                  if (err) {
                    alert(err)
                  } else {
                    $.ajax({
                      type: 'POST',
                      url: 'db/transfer',
                      dataType: 'json',
                      data: {transferObj: JSON.stringify(obj)},
                      error:function(response){
                        checkToken(response);
                      },
                      success: function (response) {

                        var $successAjaxModal = $("#success-Ajax-Modal");
                        $successAjaxModal.modal();

                        var $confirmSuccess = $("#confirm-success");
                        $confirmSuccess.on("click", function(){
                          $.modal.close();
                          window.location.href = '/data?id=5';
                        });
                      }
                    });
                  }
                });
                  break;
                default:

              }

            }else{
              /*------------------- with constraints" --------------------------*/

              switch ($dataModel.val()) {
                case "Expand (Right join)":
                  associationColumnAdd(transferObj, $addTable.val(), columns, $addConstraintsMainTable.val() + "." + $addConstraintsMainColumn.val(), constraintReference, 'outer', function (err, obj) {
                    if (err) {
                      alert(err)
                    } else {
                      $.ajax({
                        type: 'POST',
                        url: 'db/transfer',
                        dataType: 'json',
                        data: {transferObj: JSON.stringify(obj)},
                        error:function(response){
                          checkToken(response);
                        },
                        success: function (response) {

                          var $successAjaxModal = $("#success-Ajax-Modal");
                          $successAjaxModal.modal();

                          var $confirmSuccess = $("#confirm-success");
                          $confirmSuccess.on("click", function(){
                            $.modal.close();
                            window.location.href = '/data?id=5';
                          });
                        }
                      });
                    }
                  });
                  break;

                case "Drop (Default - left join)":
                  associationColumnAdd(transferObj, $addTable.val(), columns, $addConstraintsMainTable.val() + "." + $addConstraintsMainColumn.val(), constraintReference, 'inner', function (err, obj) {
                    if (err) {
                      alert(err)
                    } else {
                      $.ajax({
                        type: 'POST',
                        url: 'db/transfer',
                        dataType: 'json',
                        data: {transferObj: JSON.stringify(obj)},
                        error:function(response){
                          checkToken(response);
                        },
                        success: function (response) {

                          var $successAjaxModal = $("#success-Ajax-Modal");
                          $successAjaxModal.modal();

                          var $confirmSuccess = $("#confirm-success");
                          $confirmSuccess.on("click", function(){
                            $.modal.close();
                            window.location.href = '/data?id=5';
                          });
                        }
                      });
                    }
                  });
                  break;
                default:

              }

            }

            return true
          }

        });

        break;
      default:

    }

  });

});

var tab6CreateTab = function(id, data){
  //TODO: insert function
};

var tab6CreateColumn = function(id, data){
  //TODO: insert function
};

/*-------------------------- insert functions ----------------------------------*/
var InsertTableInfo = function($table, $column, $rename, $error){

  $table.empty();
  $column.empty();
  $rename.empty();

  for (var table in list.data[list.adminDB]) {

    var table_option = $("<option>" + table + "</option>");
    $table.append(table_option);

    if(table === $table.val()){
      for (var column in list.data[list.adminDB][table].columns) {
        var column_option = $("<option>" + list.data[list.adminDB][table].columns[column].Field + "</option>");
        $column.append(column_option);
        $rename.val(list.data[list.adminDB][table].columns[column].Field);
      }
    }

  }

  $table.on("change click", function(){

    /*-------------------- if multiple part is not empty, empty it first -----------*/
    if($("#column-placeholder ul").children){
      $("#column-placeholder ul").empty();
    }else{
      console.log("ul empty, continue to do the job");
    }

    for (var item in list.data[list.adminDB]) {

      if (item === $table.val()) {
        $column.empty();
        $rename.empty();

        for (var column in list.data[list.adminDB][item].columns) {
          var column_option = $("<option>" + list.data[list.adminDB][item].columns[column].Field + "</option>");
          $column.append(column_option);
          $rename.val($column.val());
        }
      }

    }

    $error.hide();
  });

}

var InsertColumnInfo = function($table, $column, $rename, $error){

  $column.on("change click", function(){

    $rename.empty();
    $rename.val($column.val());

    if($error){
      $error.hide();
    }

  });

}

var InsertMoreColumnInfo = function($column, $rename){

}

var insertOptions = function(elementTable, elementColumn) {

  elementTable.empty();
  var empty_option = $("<option> </option>");
  elementTable.append(empty_option);

  for (var table in list.data[list.adminDB]) {

    var table_option = $("<option>" + table + "</option>");
    elementTable.append(table_option);

    //TODO: add change column
  }


  elementTable.on("change click", function() {

    for (var item in list.data[list.adminDB]) {

      if (item === $(this).val()) {
        elementColumn.empty();
        for (var column in list.data[list.adminDB][item].columns) {
          var column_option = $("<option>" + list.data[list.adminDB][item].columns[column].Field + "</option>");
          elementColumn.append(column_option);
        }
      }

    }
  });

}

var insertConstraints = function(chooseTableName, sourceTable, sourceColumn, refTable, refColumn){
  sourceTable.empty();
  refTable.empty();

  /*----------------- create source table content ------------------------------*/
  for (var table in list.data[list.adminDB]) {

    if(table === chooseTableName){
      var table_option = $("<option>" + table + "</option>");
      sourceTable.append(table_option);

      sourceColumn.empty();

      for (var column in list.data[list.adminDB][table].columns) {
        var column_option = $("<option>" + list.data[list.adminDB][table].columns[column].Field + "</option>");
        sourceColumn.append(column_option);
      }
    }

  }

  /*----------------- create source table content ------------------------------*/
  var table_option = $("<option>Matrix Data</option>");
  refTable.append(table_option);

  refColumn.empty();
  for(var table in list.data){
    if(table != list.adminDB){
      for(workflow in list.data[table]){
        for(column in list.data[table][workflow].columns){
          var value = list.data[table][workflow].columns[column].Field;
          var column_option = $("<option>" + value + "</option>");
          refColumn.append(column_option);
        }
      }
    }
  }

}

var createDataWizardStep = function(callback){

  /*-------------------------structure wizard step -----------------------------*/
  var $dataAssociationMain = $("#data-association-main");
  $dataAssociationMain.empty();

  //console.log(transferObj);
  if($.isEmptyObject(transferObj)){
    /*------------show step 1------------------*/
    var section = $("<section id=\"data-association-step-1\"><h3>&nbsp; Matrix is empty, please finish the following steps:</h3>"
    +"<div id=\"create-view\" class=\"wizard\"><h3>Please choose <strong>Primary Key</strong></h3><section><div><h3>* You need to copy one column to matrix as the primary key:</h3>"
    +"<div class=\"grid\"><div class=\"1/2 grid__cell\"><p>Source Table: </p><select id=\"PK-table\"></select></div><div class=\"1/2 grid__cell\">"
    +"<p>Primary Key Column: </p><select id=\"PK-column\"></select></div></div><br><span class=\"red\" id=\"error-message\" style=\"display:none;\"><strong><i class=\"fa fa-exclamation\" aria-hidden=\"true\"></i> Please fill all required fields, check data correction.</strong></span>"
    +"</div></section><h3>Rename <strong>Primary Key</strong></h3><section><div><h3>* Would you like to rename your <strong>Primary Key?</strong></h3><div class=\"grid\">"
    +"<div class=\"grid__cell\"><p>New Primary Key name: </p><input class=\"text-input\" id=\"step-1-id\" type=\"text\" /></div></div></div></section><h3>Submit</h3>"
    +"<section><div id=\"data-association-step-1-final\"></div></section></div></section>");
    $dataAssociationMain.append(section);

    callback("step1");

  }else{
    /*-----------show step 2-------------------*/
    var section = $("<section id=\"data-association-step-2\"><h2>&nbsp; Add more data? or go to Matrix Data.</h2>"
    +"<div id=\"add-view\" class=\"wizard\"><h3>Select data</h3>"
    +"<section><div><h3><i class=\"fa fa-plus-square-o\" aria-hidden=\"true\"></i> Please choose column(s) to add</h3><div class=\"grid\">"
    +"<div class=\"1/3 grid__cell\"><h5>Source table:</h5><select id=\"add-table\"></select></div>"
    +"<div class=\"1/3 grid__cell\"><h5>Select column:</h5><select id=\"add-column\"></select></div>"
    +"<div class=\"1/3 grid__cell\"><h5>Target column name:</h5><input id=\"add-constraints-rename\" class=\"text-input\" type=\"text\"></div></div></div>"
    +"<div class=\"column-placeholder\" id=\"column-placeholder\"><ul></ul></div><div class=\"\">"
    +"<div class=\"grid\"><div class=\"1/3 grid__cell\"></div><div class=\"1/3 grid__cell data-association-column\">"
    +"<span id=\"data-association-step-2-add-column\">ADD  &nbsp;<i class=\"fa fa-plus-square-o\" aria-hidden=\"true\"></i></span>"
    +"<span id=\"data-association-step-2-remove-column\">REMOVE  &nbsp;<i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></span></div>"
    +"<div class=\"1/3 grid__cell\"></div></div></div>"
    +"<br><span class=\"red\" id=\"error-message-2\" style=\"display:none\"><strong><i class=\"fa fa-exclamation\" aria-hidden=\"true\"></i> Please fill all required fields, make sure select column are not duplicated, and target column names are unique and not existed in matrix.</strong></span></section>"
    +"<h3>Set up key relationship</h3>"
    +"<section><div class=\"\" id=\"add-constraints-wrap-1\"><h3>* Select matching key columns </h3><div class=\"grid\"><div class=\"grid__cell\"><div class=\"grid\"><div class=\"1/2 grid__cell\">"
    +"<span>Source table:<select class=\"\" name=\"\" id=\"add-constraints-main-table\"></select></span></div><div class=\"1/2 grid__cell\"><span>key column:"
    +"<select class=\"\" name=\"\" id=\"add-constraints-main-column\"></select></span></div><div class=\"1/2 grid__cell\"><span>Target table:<select class=\"\" name=\"\" id=\"add-constraints-reference-table\">"
    +"</select></span></div><div class=\"1/2 grid__cell\"><span>key column:<select class=\"\" name=\"\" id=\"add-constraints-reference-column\"></select></span></div></div></div>"
    +"</div></div><div class=\"\" id=\"add-constraints-wrap-2\"><h3>* You do not need to set up constraints, please click next to continue.</h3>"
    +"</div><br><span class=\"red\" id=\"error-message-3\" style=\"display:none\"><strong><i class=\"fa fa-exclamation\" aria-hidden=\"true\"></i> Please fill all required fields, new name should be different with maxtrix exist name.</strong></span></section><h3>Confirm</h3><section>"
    +"<div class=\"grid\"><div class=\"grid__cell\"><h5>How do you want to join data tables?</h5><select id=\"data-model\"><option>Drop (Default - left join)</option><option>Expand (Right join)</option></select></div></div><div id=\"data-association-step-2-final\"></div></section></div></section>");
    $dataAssociationMain.append(section);

    callback("step2");

  }

}

/*-------------------------- data association related functions ----------------*/

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
      alert("Column name cannot repeat!");
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

function associationColumnCreate(obj, table, sourceName, targetName, cb) {
  obj = {
    mainTable: '',
    joinTable: [],
    columns: [],
    constraints: []
  }

  obj.mainTable = table;
  obj.columns.push({
    source: sourceName,
    target: targetName
  });
  return cb(null, obj);
}

function associationColumnAdd(obj, table, columns, constraintKey, constraintReference, constraintType, cb) {
  for (var i=0; i<obj.columns.length; i++) {
    for (var j=0; j<columns.length; j++) {
      if (obj.columns[i].target == columns[j].targetName) {
        return cb('Column name cannot repeat, already have column name ' + obj.columns[i].target + '!', obj);
      }
    }
  }
  if (table != obj.mainTable && obj.joinTable.indexOf(table) < 0) {
    obj.joinTable.push(table);
    obj.constraints.push({
      key: constraintKey,
      reference: constraintReference,
      type: constraintType
    });
  }
  for (var i=0; i<columns.length; i++) {
    obj.columns.push(columns[i]);
  }

  return cb(null, obj);
}

function associationColumnDelete(obj, columns, cb) {
  for (var j=0; j<columns.length; j++) {
    var table = '';
    var index = 0;
    var num = 0;

    for (var i=0; i<obj.columns.length; i++) {
      if (columns[j] == obj.columns[i].target) {
        table = obj.columns[i].source.split('.')[0];
        index = i;
      }
    }
    obj.columns.splice(index, 1);

    for (var i=0; i<obj.columns.length; i++) {
      if (table == obj.columns[i].source.split('.')[0]) {
        num++;
      }
    }
    if (num == 0) {
      for (var i=0; i<obj.constraints.length; i++) {
        if (obj.constraints[i].key.split('.')[0] == table) {
          index = i;
        }
      }
      obj.constraints.splice(index, 1);
    }
  }

  return cb(null, obj);
}

/*-------------- Tab 7 event bind ----------------------------------------------*/
var $tab7 = $("ul.horizontal li:nth-child(7)");

$tab7.on("click", function() {

  createList("export-overview-left-block",tab7CreateDd , tab7CreateTab, tab7CreateColumn, function(message) {

    if (message === "finish") {
      bindToggleEvent();
    }


  });



});

var tab7CreateDd = function(id, data){
  var $id = $("#" + id);

  $id.on("click", function() {

    var $exportPreview = $("#export-preview ul li");

    if($exportPreview.length > 0){

      var str = id.split("-");
      var arr = [];
      var trigger = 1;

      for(var i = 0; i< $exportPreview.length; i++){
        var value = $exportPreview.eq(i).find('span').first().text();
        arr.push(value);
      }

      for(var item in arr){
        if(arr[item] === "Matrix Data"){
          trigger = 0;
          break;
        }else{
          trigger = 1;
        }
      }

      if(trigger === 1){
        var div = $("<li class=\"1/4 grid__cell\"><div class=\"export-lable\"><span>" + "Matrix Data" + "</span><span class=\"export-right\"><i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></span></div></li>");
        $("#export-preview ul").append(div);

      }

    }else{

      var str = id.split("-");
      var div = $("<li class=\"1/4 grid__cell\"><div class=\"export-lable\"><span>" + "Matrix Data" + "</span><span class=\"export-right\"><i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></span></div></li>");
      $("#export-preview ul").append(div);

    }

    var $exportList= $("#export-preview ul li");

    $exportList.each(function(){
      $(this).find('span').eq(1).on("click", function(){
        $(this).parent().parent().remove();
      })
    });

    // var div = $("<div class='data-table-wrap'><table class='data-table'><thead id='preview-heading'></thead><tbody id='preview-table'></tbody></table></div>");
    // $exportPreview.append(div);
    //
    // var tr = $("<tr></tr>");
    // var $previewHeading = $("#preview-heading");
    // $previewHeading.append(tr);
    //
    // var sequenceArr = [];
    //
    // for (var i = 0; i < data.columns.length; i++) {
    //
    //   // if (data.columns[i].Field != "id") {
    //     var td = $("<td>" + data.columns[i].Field + "</td>");
    //     tr.append(td);
    //     sequenceArr.push(data.columns[i].Field);
    //   // }
    //
    // }
    //
    // var $previewTable = $("#preview-table");
    //
    // for (var item in data.data) {
    //
    //   var content_tr = $("<tr></tr>");
    //   $previewTable.append(content_tr);
    //
    //   for (var i = 0; i < sequenceArr.length; i++) {
    //     for (var name in data.data[item]) {
    //       if (sequenceArr[i] === name) {
    //
    //         /*--------------- Insert table with corret order -------------------*/
    //         if(data.data[item][name] === null){
    //           var content_td = $("<td>" + " " + "</td>")
    //           content_tr.append(content_td);
    //         }else{
    //           var content_td = $("<td>" + data.data[item][name] + "</td>")
    //           content_tr.append(content_td);
    //         }
    //
    //       }
    //     }
    //   }
    // }

    exportPDF($exportList);

  });
};

var tab7CreateTab = function(id, data) {

  var $id = $("#" + id);

  $id.on("click", function() {

    var $exportPreview = $("#export-preview ul li");

    if($exportPreview.length > 0){

      var str = id.split("-");
      var arr = [];
      var trigger = 1;

      for(var i = 0; i< $exportPreview.length; i++){
        var value = $exportPreview.eq(i).find('span').first().text();
        arr.push(value);
      }

      for(var item in arr){
        if(arr[item] === str[str.length - 1]){
          trigger = 0;
          break;
        }else{
          trigger = 1;
        }
      }

      if(trigger === 1){
        var div = $("<li class=\"1/4 grid__cell\"><div class=\"export-lable\"><span>" + str[str.length - 1] + "</span><span class=\"export-right\"><i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></span></div></li>");
        $("#export-preview ul").append(div);
      }

    }else{

      var str = id.split("-");
      var div = $("<li class=\"1/4 grid__cell\"><div class=\"export-lable\"><span>" + str[str.length - 1] + "</span><span class=\"export-right\"><i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></span></div></li>");
      $("#export-preview ul").append(div);

    }

    var $exportList= $("#export-preview ul li");

    $exportList.each(function(){
      $(this).find('span').eq(1).on("click", function(){
        $(this).parent().parent().remove();
      })
    });

    // var div = $("<div class='data-table-wrap'><table class='data-table'><thead id='preview-heading'></thead><tbody id='preview-table'></tbody></table></div>");
    // $exportPreview.append(div);
    //
    // var tr = $("<tr></tr>");
    // var $previewHeading = $("#preview-heading");
    // $previewHeading.append(tr);
    //
    // var sequenceArr = [];
    //
    // for (var i = 0; i < data.columns.length; i++) {
    //
    //   // if (data.columns[i].Field != "id") {
    //     var td = $("<td>" + data.columns[i].Field + "</td>");
    //     tr.append(td);
    //     sequenceArr.push(data.columns[i].Field);
    //   // }
    //
    // }
    //
    // var $previewTable = $("#preview-table");
    //
    // for (var item in data.data) {
    //
    //   var content_tr = $("<tr></tr>");
    //   $previewTable.append(content_tr);
    //
    //   for (var i = 0; i < sequenceArr.length; i++) {
    //     for (var name in data.data[item]) {
    //       if (sequenceArr[i] === name) {
    //
    //         /*--------------- Insert table with corret order -------------------*/
    //         if(data.data[item][name] === null){
    //           var content_td = $("<td>" + " " + "</td>")
    //           content_tr.append(content_td);
    //         }else{
    //           var content_td = $("<td>" + data.data[item][name] + "</td>")
    //           content_tr.append(content_td);
    //         }
    //
    //       }
    //     }
    //   }
    // }

    exportPDF($exportList);

  });

}

var tab7CreateColumn = function(id, data) {}

var exportPDF = function(element){

  var arr = [];
  var exportData = [
    //{type: 'csv', name: 'test', data: data.data},
    //{type: 'pdf', name: 'test', data: JSON.stringify(data.data)}
  ];
  var exportFunc = function(exportData, name) {

  list.getData(list.adminDB, name, function (response) {
    exportData.push({
      type: 'xlsx', name: name, data: response
    });
  });
  }


  for(var i = 0; i< element.length; i++){
    var value = element.eq(i).find('span').first().text();
    arr.push(value);
  }

  for(var item in arr){

    if(arr[item] === "Matrix Data"){

      var user = list.workflowDB;
      var workflow = 'workflow' + list.workflowId;

      list.getData(user, workflow, function (response) {
        exportData.push({
          type: 'xlsx', name: 'Matrix Data', data: response
        });
      });

    }else{

      exportFunc(exportData, arr[item]);

    }
  }




  /*----------------- bind event to export button ----------------------------*/
  var $dataExport = $("#dataExport");
  $dataExport.unbind("click");
  $dataExport.on("click", function(){

    var $loading = $(".loading");
    $loading.show();

    exportFile.export(exportData, 'file/export', 'zip', function (response, type) {
      console.log(response);
      var blob = new Blob([response], {type: type});
      var fileName = "ontask_data.zip";
      saveAs(blob, fileName);

      var $loading = $(".loading");
      $loading.hide();
    });

  });

};

/*---------------------- Tab functions -----------------------------------------*/
var createList = function(id, funcDd, funcTab, funcColumn, callback) {

  var $id = $("#" + id);
  $id.empty();

  if (list.data != null) {
    var ul = $("<ul></ul>");
    $id.append(ul);
    var lableLength = 12;
    var database = list.adminDB;
    var li = $("<li class='data-database-icon' id='" + id + "-database-" + database + "'>" + "Available Data" + "</li>");
    ul.append(li);
    var sub_ul = $("<ul></ul>");
    li.append(sub_ul);
    for (var table in list.data[database]) {
      if(table.length > lableLength){
        var sub_li = $("<li class='data-table-icon' id='" + id + "-database-" + database + "-table-" + table + "' class=\"tooltip\" title=\"" + table + "\">" + table.substring(0, lableLength) + " ... " + "</li>")
      }else{
        var sub_li = $("<li class='data-table-icon' id='" + id + "-database-" + database + "-table-" + table + "'>" + table + "</li>")
      }
      sub_ul.append(sub_li);
      var sub_sub_ul = $("<ul></ul>");
      sub_li.append(sub_sub_ul);
      funcTab("" + id + "-database-" + database + "-table-" + table + "", list.data[database][table]);
      for (var column in list.data[database][table]) {
        if (column === "columns") {
          for(var i= 0; i<list.data[database][table][column].length; i++){
            if(list.data[database][table][column][i].Field.length > lableLength){
              var sub_sub_li = $("<li class='data-column-icon' id='" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "'>" + list.data[database][table][column][i].Field.substring(0, lableLength) + " ... </li>");
            }else{
              var sub_sub_li = $("<li class='data-column-icon' id='" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "'>" + list.data[database][table][column][i].Field + "</li>");
            }
              sub_sub_ul.append(sub_sub_li);
              //TODO: insert functions;
              funcColumn("" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "");
          }
        } else {}
      }
    }

    var ul_matrix = $("<ul></ul>");
    $id.append(ul_matrix);
    var database_matrix = list.workflowDB;
    var li_matrix = $("<li class='data-martix-database-icon' id='" + id + "-database-" + database_matrix + "'>" + "Matrix Data" + "</li>");
    ul_matrix.append(li_matrix);

    var sub_ul_matrix = $("<ul></ul>");
    li_matrix.append(sub_ul_matrix);

    for (var table in list.data[database_matrix]) {
      funcDd("" + id + "-database-" + database_matrix + "", list.data[database_matrix][table]);
      for (var column in list.data[database_matrix][table]) {
        if (column === "columns") {
          for(var i=0; i<list.data[database_matrix][table][column].length; i++){
            if(list.data[database_matrix][table][column][i].Field.length > lableLength){
              var sub_li = $("<li class='data-column-icon' id='" + id + "-database-" + database_matrix + "-table-" + table + "-column-" + list.data[database_matrix][table][column][i].Field + "'>" + list.data[database_matrix][table][column][i].Field.substring(0, lableLength) + " ... </li>");
            }else{
              var sub_li = $("<li class='data-column-icon' id='" + id + "-database-" + database_matrix + "-table-" + table + "-column-" + list.data[database_matrix][table][column][i].Field + "'>" + list.data[database_matrix][table][column][i].Field + "</li>");
            }
              sub_ul_matrix.append(sub_li);
              funcColumn("" + id + "-database-" + database_matrix + "-table-" + table + "-column-" + list.data[database_matrix][table][column][i].Field + "");
          }
        } else {}
      }
    }



    // for (var database in list.data) {
    //   console.log(database);
    //   var ul = $("<ul></ul>");
    //   $id.append(ul);
    //
    //
    //
    //   /*------------------------ change show database label name ---------------*/
    //
    //   var lableLength = 12;
    //
    //   if(database === list.adminDB){
    //     var li = $("<li class='data-database-icon' id='" + id + "-database-" + database + "'>" + "Available Data" + "</li>");
    //     ul.append(li);
    //
    //     var sub_ul = $("<ul></ul>");
    //     li.append(sub_ul);
    //
    //     for (var table in list.data[database]) {
    //
    //       if(table.length > lableLength){
    //         var sub_li = $("<li class='data-table-icon' id='" + id + "-database-" + database + "-table-" + table + "' class=\"tooltip\" title=\"" + table + "\">" + table.substring(0, lableLength) + " ... " + "</li>")
    //       }else{
    //         var sub_li = $("<li class='data-table-icon' id='" + id + "-database-" + database + "-table-" + table + "'>" + table + "</li>")
    //       }
    //
    //       sub_ul.append(sub_li);
    //
    //       var sub_sub_ul = $("<ul></ul>");
    //       sub_li.append(sub_sub_ul);
    //
    //       funcTab("" + id + "-database-" + database + "-table-" + table + "", list.data[database][table]);
    //
    //       for (var column in list.data[database][table]) {
    //
    //         if (column === "columns") {
    //
    //           for(var i= 0; i<list.data[database][table][column].length; i++){
    //
    //             if(list.data[database][table][column][i].Field.length > lableLength){
    //               var sub_sub_li = $("<li class='data-column-icon' id='" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "'>" + list.data[database][table][column][i].Field.substring(0, lableLength) + " ... </li>");
    //             }else{
    //               var sub_sub_li = $("<li class='data-column-icon' id='" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "'>" + list.data[database][table][column][i].Field + "</li>");
    //             }
    //               sub_sub_ul.append(sub_sub_li);
    //
    //               //TODO: insert functions;
    //               funcColumn("" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "");
    //           }
    //
    //         } else {}
    //       }
    //
    //     }
    //   }else{
    //     var li = $("<li class='data-martix-database-icon' id='" + id + "-database-" + database + "'>" + "Matrix Data" + "</li>");
    //     ul.append(li);
    //
    //     var sub_ul = $("<ul></ul>");
    //     li.append(sub_ul);
    //
    //     for (var table in list.data[database]) {
    //       // var sub_li = $("<li class='data-table-icon' id='" + id + "-database-" + database + "-table-" + table + "'>" + table + "</li>")
    //       // sub_ul.append(sub_li);
    //       //
    //       // var sub_sub_ul = $("<ul></ul>");
    //       // sub_li.append(sub_sub_ul);
    //       //
    //       // funcTab("" + id + "-database-" + database + "-table-" + table + "", list.data[database][table]);
    //
    //       funcDd("" + id + "-database-" + database + "", list.data[database][table]);
    //
    //       for (var column in list.data[database][table]) {
    //
    //         if (column === "columns") {
    //
    //           for(var i=0; i<list.data[database][table][column].length; i++){
    //             if(list.data[database][table][column][i].Field.length > lableLength){
    //               var sub_li = $("<li class='data-column-icon' id='" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "'>" + list.data[database][table][column][i].Field.substring(0, lableLength) + " ... </li>");
    //             }else{
    //               var sub_li = $("<li class='data-column-icon' id='" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "'>" + list.data[database][table][column][i].Field + "</li>");
    //             }
    //               sub_ul.append(sub_li);
    //
    //               funcColumn("" + id + "-database-" + database + "-table-" + table + "-column-" + list.data[database][table][column][i].Field + "");
    //           }
    //
    //         } else {}
    //       }
    //
    //     }
    //
    //
    //   }
    //
    //
    //
    // }
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


/*--------------- Data Import from data source ---------------------------------*/

$("#dbSubmit").click(function(e) {
  e.preventDefault();

  var connection = {
    host: $("#dbHost").val().toLowerCase(),
    user: $("#dbUser").val().toLowerCase(),
    password: $("#dbPassword").val().toLowerCase(),
    database: $("#dbDatabase").val().toLowerCase()
  }

  $.ajax({
    type: 'POST',
    url: 'db/create',
    dataType: 'json',
    data: {
      'connection': connection
    },
    error:function(response){
      checkToken(response);
    },
    success: function(response) {
      $("#dbHost").val('');
      $("#dbUser").val('');
      $("#dbPassword").val('');
      $("#dbDatabase").val('');
      $.ajax({
       type: 'POST',
       url: 'db/get',
       dataType: 'json',
       data: {},
       error:function(response){
         checkToken(response);
       },
       success: function(response) {
        //  multipDataString = response;
         //
        //  var $dataOverviewLeftBlock = $("#data-overview-left-block");
        //  $dataOverviewLeftBlock.empty();
         //
         for (var i = 0; i < response.data.length; i++) {
        //   insertDataInfo(JSON.parse(response.data[counter].connection_string).database, i);

           $.ajax({
            type: 'POST',
            url: 'db/connection',
            dataType: 'json',
            data: {dbInfo: JSON.parse(response.data[i].connection_string)},
            error:function(response){
              checkToken(response);
            },
            success: function(response) {
             console.log(response);
            }
           });

         }
       }
      });

      // var $dataOverviewLeftBlock = $("#data-overview-left-block");
      // $dataOverviewLeftBlock.empty();
      // insertDataInfo('admindb', 1);
      // insertDataInfo('', 2);
    }
  });
});


//----------------- Data Export ----------------

$("#dataExport").click(function() {
  alert('Please click a table from left list first.');
});

function exportCSV(dbName, key, csvData) {
  exportFile.export(csvData, 'file/export', 'csv', function(response, type) {
    var blob = new Blob([response], {type: type});
    var fileName = dbName + '-' + key + '.csv';
    saveAs(blob, fileName);
  });
}
