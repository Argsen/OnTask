/*
* workflow index.js
*/

/*----------------- nav bar control -------------------------- */
$(document).ready(function() {

  $(document).ajaxStart(function() {
    var $loading = $(".loading");
    $loading.show();
  })

  $(document).ajaxStop(function() {
    var $loading = $(".loading");
    $loading.hide();
  })

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
  var onTaskInfo = JSON.parse(window.localStorage.getItem('onTaskInfo'));

  var $overviewSubHeading = $("#notification-sub-heading");
  if (onTaskInfo != null) {
    $overviewSubHeading.empty();
    var div = $("<i class='fa fa-user-circle' aria-hidden='true'></i><span class='name'>" + onTaskInfo.lastName + ',' + onTaskInfo.firstName + "</span>");
    $overviewSubHeading.append(div);

  } else {
    console.log("no local strorage");
    window.location.href = "/"
  }

  /*---------------------- draw SVG workflow -----------------------------------*/

  $.ajax({
    type: 'GET',
    url: 'rule/get',
    dataType: 'json',
    data: '',
    error: function (response) {
      checkToken(response);
    },
    success: function (response) {
      drawSVG(response.data);
    }
  });

});

var nav = function(element, url) {
  element.on("click", function() {
    window.location = url;
  });
}

/*----------------- End nav bar control -------------------------- */

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

  chart.drawSVG('workflow-big-screen', big_screen_settings);

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
