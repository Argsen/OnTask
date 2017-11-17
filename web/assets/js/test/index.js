// $(document).ready(function() {
//   $(".directory-list ul > li > ul").hide();
//
//   $(".directory-list ul > li").click(function(e) {
//     e.stopPropagation();
//
//     $(this).children().toggle(function(e) {
//       if (!$(this).is(":visible")) {
//         $(this).find("ul").hide();
//         $(this).find("sub").show();
//       };
//     });
//
//     $(this).siblings().each(function(i) {
//       if ($(this).children("ul").length > 0) {
//         if ($(this).children("ul").css("display").toLowerCase() == "block") {
//           $(this).children().toggle(function(e) {
//             if (!$(this).is(":visible")) {
//               $(this).find("ul").hide();
//               $(this).find("sub").show();
//             };
//           });
//         }
//       }
//     });
//   });
//
//   $(".directory-list ul > li").each(function(i) {
//     if ($(this).children("ul").length > 0) {
//       // $(this).css("cursor", "pointer").prepend($("<sub class='fa fa-plus-square-o' aria-hidden='true'/>").text(""));
//       $(this).css("cursor", "pointer").children("ul").before($("<sub class='fa fa-plus-square-o' aria-hidden='true'/>").text("[Check Details]"));
//     } else {
//       $(this).css("cursor", "pointer");
//     };
//   });
// });
//
//

// var transferObj = {};
//
// $(document).ready(function() {
//
//   /*------------------------- retrive transferObj when load page----------------*/
//   $.ajax({
//     type: 'POST',
//     url: 'workflow/get',
//     dataType: 'json',
//     data: {},
//     success: function(response) {
//
//       var $dataAssociationStep1 = $("#data-association-step-1");
//       var $dataAssociationStep2 = $("#data-association-step-2");
//
//       if (response.data.transfer) {
//         transferObj = JSON.parse(response.data.transfer);
//
//         console.log(transferObj);
//         $dataAssociationStep1.hide();
//         $dataAssociationStep2.show();
//
//       }else{
//         $dataAssociationStep1.show();
//         $dataAssociationStep2.hide();
//       }
//     }
//   });
//
//   list.init('db/connection', ['admindb'], function(response) {
//
//     var $dataAssociationStep1 = $("#data-association-step-1");
//     var $dataAssociationStep2 = $("#data-association-step-2");
//
//     /*------------- step 1-----------------------*/
//     if ($dataAssociationStep1.is(':visible')) {
//       // console.log("not hidden");
//
//       var $PKTable = $("#PK-table");
//       var $PKColumn = $("#PK-column");
//
//       insertOptions($PKTable, $PKColumn);
//
//       $PKTable.on("change click", function() {
//         var $errorMessage = $("#error-message");
//         $errorMessage.hide();
//       });
//
//     };
//
//     /*---------------- step 2----------------------*/
//     if ($dataAssociationStep2.is(':visible')) {
//       var $addTable = $("#add-table");
//       var $addColumn = $("#add-column");
//
//       insertOptions($addTable, $addColumn);
//
//       $addTable.on("change click", function() {
//         var addConstraintsRename = $("#add-constraints-rename");
//         addConstraintsRename.val($addColumn.val());
//
//         var $errorMessage = $("#error-message-2");
//         $errorMessage.hide();
//
//       });
//
//       $addColumn.on("change click", function () {
//         var addConstraintsRename = $("#add-constraints-rename");
//         addConstraintsRename.val($addColumn.val());
//
//         var $errorMessage = $("#error-message-2");
//         $errorMessage.hide();
//       })
//
//     };
//
//   });
//
//   //  /*------------------bind add btn funciton -----------------------------------*/
//   //  var $addTableBtn = $("#add-table-btn");
//   //  var $addColumnBtn = $("#add-column-btn");
//   //
//   //  $addTableBtn.on("click", function(){
//   //    var $ul = $("#add-preview");
//   //
//   //    var $addTable = $("#add-table");
//   //    var $addColumn = $("#add-column");
//   //
//   //    if($addTable.val() != null && $addColumn.val() != null){
//   //      var li = $("<li>Table:<strong>" + $addTable.val() + "</strong> Column:<strong>" + $addColumn.val() + "</strong> has been added.</li>");
//   //      $ul.append(li);
//   //    }else{
//   //      console.log("you need to fill all of them.")
//   //    }
//   //
//   //  });
//   //
//   //  $addColumnBtn.on("click", function() {
//   //    var $last_li = $("#add-preview li:last-child");
//   //    $last_li.remove();
//   //  });
//
// });
//
//
//
// /*-------------------------- no workflow exist, create new workflow ------------*/
// $("#create-view").steps({
//   headerTag: "h3",
//   bodyTag: "section",
//   transitionEffect: "slideLeft",
//   autoFocus: true,
//   onStepChanging: function(event, currentIndex, newIndex) {
//
//     switch (currentIndex) {
//
//       case 0:
//         var $PKTable = $("#PK-table");
//         var $PKColumn = $("#PK-column");
//
//         var $errorMessage = $("#error-message");
//         $errorMessage.hide();
//
//         if ($PKTable.val() == null || $PKColumn.val() == null) {
//           $errorMessage.show();
//           return false
//         } else {
//
//           var $step1Id = $("#step-1-id");
//           $step1Id.val($PKColumn.val());
//
//           return true
//         };
//
//         break;
//       case 1:
//
//         var $dataAssociationStep1Final = $("#data-association-step-1-final");
//         var $PKTable = $("#PK-table");
//         var $PKColumn = $("#PK-column");
//
//         $dataAssociationStep1Final.empty();
//         var p = $("<p>Are you sure to set Table: <strong>" + $PKTable.val() + "</strong> column: <strong>" + $PKColumn.val() + " </strong> as your primary key?</p>");
//         $dataAssociationStep1Final.append(p);
//         return true
//         break;
//       default:
//         return true
//
//     }
//
//   },
//   onFinishing: function(event, currentIndex) {
//     //console.log("finish button clicked!");
//     var $PKTable = $("#PK-table");
//     var $PKColumn = $("#PK-column");
//     var $step1Id = $("#step-1-id");
//
//     transferObj = viewColumnCreate(transferObj, $PKTable.val(), $PKTable.val() + '.' + $PKColumn.val(), $step1Id.val());
//
//     $.ajax({
//       type: 'POST',
//       url: 'db/transfer',
//       dataType: 'json',
//       data: {
//         transferObj: JSON.stringify(transferObj)
//       },
//       success: function(response) {
//         //TODO: add response callback error handler
//         var $successModal = $("#successModal");
//         $successModal.modal();
//
//         var $confirmSuccess = $("#confirm-success");
//         $confirmSuccess.on("click", function(){
//           $.modal.close();
//           windo
//         });
//       }
//     });
//     return true;
//   }
// });
//
// /*------------------------- if has workflow, add more workflow------------------*/
// $("#add-view").steps({
//   headerTag: "h3",
//   bodyTag: "section",
//   transitionEffect: "slideLeft",
//   autoFocus: true,
//   onStepChanging: function(event, currentIndex, newIndex) {
//
//     switch (currentIndex) {
//       case 0:
//         var $addTable = $("#add-table");
//         var $addColumn = $("#add-column");
//         var $addConstraintsRename = $("#add-constraints-rename");
//
//         if ($addTable.val() === '' || $addColumn.val() === '' || $addConstraintsRename.val() === '') {
//           //console.log("has empty, please fill in");
//           var $errorMessage2 = $("#error-message-2");
//           $errorMessage2.show();
//
//           return false
//         } else {
//           //console.log("all full, continue");
//           var $addTable = $("#add-table");
//           var $addColumn = $("#add-column");
//
//           /*-------------judge if this is main table to show constraints----------*/
//           var $addConstraintsWrap1 = $("#add-constraints-wrap-1");
//           var $addConstraintsWrap2 = $("#add-constraints-wrap-2");
//
//           if (transferObj.mainTable === $addTable.val()) {
//             //console.log("The same with main table, do not show constrants");
//             $addConstraintsWrap1.hide();
//             $addConstraintsWrap2.show();
//           } else {
//           //console.log("show constarants blocks");
//           $addConstraintsWrap2.hide();
//           $addConstraintsWrap1.show();
//
//           //TODO: add function to constraints functions
//           var $addConstraintsMainTable = $("#add-constraints-main-table");
//           var $addConstraintsMainColumn = $("#add-constraints-main-column");
//
//           var $addConstraintsReferenceTable = $("#add-constraints-reference-table");
//           var $addConstraintsReferenceColumn = $("#add-constraints-reference-column");
//
//           insertOptions($addConstraintsMainTable, $addConstraintsMainColumn);
//           insertOptions($addConstraintsReferenceTable, $addConstraintsReferenceColumn);
//         }
//           return true
//         }
//
//         break
//
//       case 1:
//
//         var $addTable = $("#add-table");
//         var $addColumn = $("#add-column");
//
//         var $dataAssociationStep2Final = $("#data-association-step-2-final");
//         $dataAssociationStep2Final.empty();
//
//         var p = $("<p>Are you sure to add Table: <strong>" + $addTable.val() + "</strong> column: <strong>" + $addColumn.val() + " </strong> to your workflow?</p>");
//         $dataAssociationStep2Final.append(p);
//
//         /*-------------------judge if empty-------------------------------------*/
//         var $addConstraintsMainTable = $("#add-constraints-main-table");
//         var $addConstraintsMainColumn = $("#add-constraints-main-column");
//
//         var $addConstraintsReferenceTable = $("#add-constraints-reference-table");
//         var $addConstraintsReferenceColumn = $("#add-constraints-reference-column");
//
//         if(transferObj.mainTable === $addTable.val()){
//
//           return true
//
//         }else{
//           if($addConstraintsMainTable.val() === null || $addConstraintsMainColumn.val() === null || $addConstraintsReferenceTable.val() === null || $addConstraintsReferenceColumn.val() === null){
//             var $errorMessage3 = $("#error-message-3");
//             $errorMessage3.show();
//
//             return false
//           }else{
//             var $errorMessage3 = $("#error-message-3");
//             $errorMessage3.hide();
//             return true
//           }
//         }
//
//         break
//       default:
//         return true
//     }
//
//   },
//   onFinishing: function(event, currentIndex) {
//     var $addTable = $("#add-table");
//     var $addColumn = $("#add-column");
//     var $addConstraintsRename = $("#add-constraints-rename");
//
//     var $addConstraintsMainTable = $("#add-constraints-main-table");
//     var $addConstraintsMainColumn = $("#add-constraints-main-column");
//
//     var $addConstraintsReferenceTable = $("#add-constraints-reference-table");
//     var $addConstraintsReferenceColumn = $("#add-constraints-reference-column");
//
//     /*------------------ submit to transferObj----------------------------------*/
//     if(transferObj.mainTable === $addTable.val()){
//       //console.log("no constraints");
//       transferObj = viewColumnAdd(transferObj, $addTable.val(), $addTable.val() + "." + $addColumn.val(), $addConstraintsRename.val(), '', '');
//
//     }else{
//       //console.log("with constraints");
//       transferObj = viewColumnAdd(transferObj, $addTable.val(), $addTable.val() + "." + $addColumn.val(), $addConstraintsRename.val(), $addConstraintsMainTable.val() + "." + $addConstraintsMainColumn.val(), $addConstraintsReferenceTable.val() + "." + $addConstraintsReferenceColumn.val());
//     }
//
//     /*----------------- ajax to server------------------------------------------*/
//
//     $.ajax({
//      type: 'POST',
//      url: 'db/transfer',
//      dataType: 'json',
//      data: {transferObj: JSON.stringify(transferObj)},
//      success: function (response) {
//
//        alert("successfully upload to onTask system!");
//        window.location.reload();
//
//      }
//     });
//
//
//     return true
//   }
//
// });
//
// /*-------------------------- insert functions ----------------------------------*/
//
// var insertOptions = function(elementTable, elementColumn) {
//
//   elementTable.empty();
//
//   for (var table in list.data.admindb) {
//
//     var table_option = $("<option>" + table + "</option>");
//     elementTable.append(table_option);
//
//     //TODO: add change column
//   }
//
//   elementTable.on("change click", function() {
//     for (var item in list.data.admindb) {
//
//       if (item === $(this).val()) {
//         elementColumn.empty();
//         for (var column in list.data.admindb[item].columns) {
//           var column_option = $("<option>" + list.data.admindb[item].columns[column].Field + "</option>");
//           elementColumn.append(column_option);
//         }
//       }
//
//     }
//   });
//
// }
//
// /*-------------------------- data association related functions ----------------*/
//
// function viewColumnCreate(obj, table, sourceName, targetName) {
//   obj = {
//     mainTable: '',
//     joinTable: [],
//     columns: [],
//     constraints: []
//   }
//
//   obj.mainTable = table;
//   obj.columns.push({source: sourceName, target: targetName});
//   return obj;
// }
//
// function viewColumnAdd(obj, table, sourceName, targetName, constraintsKey, constraintsReference) {
//   for (var i = 0; i < obj.columns.length; i++) {
//     if (obj.columns[i].target == targetName) {
//       alert("Column name cannot repeat!");
//       return obj;
//     }
//   }
//   if (table != obj.mainTable && obj.joinTable.indexOf(table) < 0) {
//     obj.joinTable.push(table);
//     obj.constraints.push({key: constraintsKey, reference: constraintsReference});
//   }
//   obj.columns.push({source: sourceName, target: targetName});
//   return obj;
// }
//
// function viewColumnDelete(obj, columnName) {
//   var table = '';
//   var index = 0;
//   var num = 0;
//
//   for (var i = 0; i < obj.columns.length; i++) {
//     if (columnName == obj.columns[i].target) {
//       table = obj.columns[i].source.split('.')[0];
//       index = i;
//     }
//   }
//   obj.columns.splice(index, 1);
//
//   for (var i = 0; i < obj.columns.length; i++) {
//     if (table == obj.columns[i].source.split('.')[0]) {
//       num++;
//     }
//   }
//   if (num == 0) {
//     for (var i = 0; i < obj.constraints.length; i++) {
//       if (obj.constraints[i].key.split('.')[0] == table) {
//         index = i;
//       }
//     }
//     obj.constraints.splice(index, 1);
//   }
//   return obj;
// }
//
// function matrixViewColumnDelete(obj, columnName) {
//   var index = 0;
//
//   for (var i = 0; i < obj.columns.length; i++) {
//     if (obj.columns[i].target == columnName) {
//       index = i;
//     }
//   }
//   obj.columns.splice(index, 1);
//   return obj;
// }

// $(document).ready(function(){
//   tinymce.init({ selector:'#ruleAction', height: 500 });
// });
//
// $("#create-rule").steps({
//   headerTag: "h3",
//   bodyTag: "section",
//   transitionEffect: "slideLeft",
//   autoFocus: true
// });


/*------------------ draw SVG workflow-----------------------------*/

// $(document).ready(function(){
//
//   /*------------------ Set up color schema---------------*/
//
//   var $workflow_red = "#e21b47",
//       $workflow_orange = "#ef7e22",
//       $workflow_yellow = "#fac70f",
//       $workflow_green = "#66a77a",
//       $workflow_blue = "#0893c9",
//       $workflow_purple = "#8774b3";
//
//
//   /*------------------ Draw flow chart ------------------*/
//
//   var big_screen_settings= {
//     'line-width': 5,
//     'line-length': 30,
//     'text-margin': 20,
//     'font-size': 14,
//     'font-color': 'black',
//     'line-color': 'black',
//     'element-color': 'black',
//     'fill': 'white',
//     'yes-text': ' ',
//     'no-text': ' ',
//     'arrow-end': 'block',
//     'scale': 1,
//     // style symbol types
//     'symbols': {
//         'start': {
//           'font-color': $workflow_red,
//           'element-color': 'green',
//           'fill': 'yellow',
//           'font-size' : 20
//         },
//         'end':{
//           'font-color': $workflow_red,
//           'element-color': 'green',
//           'fill': 'yellow',
//           'font-size' : 20
//         }
//     },
//     // even flowstate support ;-)
//     'flowstate' : {
//         'dataMangement' : {'fill': 'white' , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_red , 'element-color' : $workflow_red },
//         'dataInput' : {'fill': 'white' , 'font-size' : 20, 'font-color' : $workflow_red , 'element-color' : $workflow_red},
//         'matrixView' : {'fill': 'white' , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_orange , 'element-color' : $workflow_orange},
//         'ruleCoordination' : {'fill': 'white', 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_green , 'element-color' : $workflow_green},
//         'ruleTitle' : {'fill': 'white' , 'font-size' : 20, 'font-color' : $workflow_green, 'element-color' : $workflow_green},
//         'ruleAction' : {'fill': 'white' , 'font-size' : 16, 'font-color' : $workflow_green, 'element-color' : $workflow_green},
//         'summary' : {'fill': 'white' , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_blue , 'element-color' : $workflow_blue},
//         // 'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
//         // 'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
//         // 'future' : { 'fill' : '#FFFF99'},
//         //'request' : { 'fill' : 'blue'}//,
//         // 'invalid': {'fill' : '#444444'},
//         // 'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
//         // 'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
//       }
//   };
//   var small_screen_settings ={
//     'line-width': 5,
//     'line-length': 30,
//     'text-margin': 20,
//     'font-size': 14,
//     'font-color': 'black',
//     'line-color': 'black',
//     'element-color': 'black',
//     'fill': 'white',
//     'yes-text': ' ',
//     'no-text': ' ',
//     'arrow-end': 'block',
//     'scale': 0.1,
//     // style symbol types
//     'symbols': {
//         'start': {
//           'font-color': $workflow_red,
//           'element-color': 'green',
//           'fill': 'yellow',
//           'font-size' : 20
//         },
//         'end':{
//           'font-color': $workflow_red,
//           'element-color': 'green',
//           'fill': 'yellow',
//           'font-size' : 20
//         }
//     },
//     // even flowstate support ;-)
//     'flowstate' : {
//         'dataMangement' : {'fill': $workflow_red  , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_red },
//         'dataInput' : {'fill': $workflow_red , 'font-size' : 20, 'font-color' : 'white' , 'element-color' : $workflow_red},
//         'matrixView' : {'fill': $workflow_orange  , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_orange},
//         'ruleCoordination' : {'fill': $workflow_green, 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_green},
//         'ruleTitle' : {'fill': $workflow_green , 'font-size' : 20, 'font-color' : 'white', 'element-color' : $workflow_green},
//         'ruleAction' : {'fill': $workflow_green , 'font-size' : 16, 'font-color' : 'white', 'element-color' : $workflow_green},
//         'summary' : {'fill': $workflow_blue, 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_blue},
//         // 'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
//         // 'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
//         // 'future' : { 'fill' : '#FFFF99'},
//         //'request' : { 'fill' : 'blue'}//,
//         // 'invalid': {'fill' : '#444444'},
//         // 'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
//         // 'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
//       }
//   };
//
//   var chart;
//   if (chart) {
//     chart.clean();
//   }
//
//   var chart = flowchart.parse(
//         "st=>start: START:>/\n"
//         + "e=>end: END\n"
//         + "op1=>operation: Manage My Data|dataMangement:>/data\n"
//         + "op2=>operation: Matrix View|matrixView:>/matrix\n"
//         + "op3=>operation: Rule Coordination|ruleCoordination:>/rule\n"
//         + "op4=>operation: Summary|summary\n"
//         + "func1=>condition: CSV file|dataInput:>/data?id=2\n"
//         + "func2=>condition: Database|dataInput:>/data?id=3\n"
//         + "func3=>condition: plugin|dataInput\n"
//         + "ruleSet=>condition: Rules Set|ruleTitle\n"
//         + "rule1=>condition: rule 1|ruleTitle\n"
//         + "rule1run=>subroutine: run|ruleAction\n"
//         + "rule1result=>subroutine: result|ruleAction\n"
//         + "rule2=>condition: rule 2|ruleTitle\n"
//         + "rule2run=>subroutine: run|ruleAction\n"
//         + "rule2result=>subroutine: result|ruleAction\n"
//         + "rule3=>condition: rule 3|ruleTitle\n"
//         + "rule3run=>subroutine: run|ruleAction\n"
//         + "rule3result=>subroutine: result|ruleAction\n"
//         + "st->op1\n"
//         + "op1->func1\n"
//         + "func1(yes)->func2(yes)->func3(no)\n"
//         + "func1(no)->op2\n"
//         + "func2(no)->op2\n"
//         + "func3(no)->op2\n"
//         + "op2->op3\n"
//         + "op3(right)->rule1(no)->rule2(no)->rule3\n"
//         + "rule1(yes)->rule1run->rule1result(left)\n"
//         + "rule2(yes)->rule2run->rule2result(left)\n"
//         + "rule3(yes)->rule3run->rule3result(left)\n"
//         + "op3->ruleSet(no)->rule1\n"
//         + "ruleSet(yes)->op4\n"
//         + "op4->e\n");
//
//   chart.drawSVG('workflow-small-screen', small_screen_settings);
//
//   /*------------------ End work flow chart drawing ------------------*/
//
//   /*------------------ bind event to zoom button--------------------*/
//   var $floatWindowMask = $("#float-window-mask");
//   $floatWindowMask.on("click", function(){
//
//     var $workflowBigScreenWrap =$("#workflow-big-screen-wrap");
//     var $floatWindowWrap =$("#float-window-wrap");
//
//     $workflowBigScreenWrap.show();
//     $floatWindowWrap.hide();
//
//     chart.drawSVG('workflow-big-screen', big_screen_settings);
//
//   });
//
//   var $workflowBigScreenZoomin =$("#workflow-big-screen-zoomin");
//   $workflowBigScreenZoomin.on("click", function(){
//
//     var $workflowBigScreenWrap =$("#workflow-big-screen-wrap");
//     var $floatWindowWrap =$("#float-window-wrap");
//
//     $workflowBigScreenWrap.hide();
//     $floatWindowWrap.show();
//
//     chart.drawSVG('workflow-small-screen', small_screen_settings);
//
//   });
//
//   // var $floatWindowHeading =$(".float-window-heading");
//   //
//   // $floatWindowHeading.mouseenter(function(){
//   //   console.log("move in");
//   //   var isMousedown = false;
//   //   $(this).mousedown(function(e){
//   //     isMousedown = true;
//   //   })
//   //
//   //   $(this).mousemove(function(e){
//   //
//   //     if(isMousedown){
//   //       console.log(e);
//   //     }
//   //
//   //   })
//   // }).mouseleave(function(){
//   //   console.log("move out");
//   // });
//   /*------------------ draggable function--------------------------*/
//
//
// });

  /*------------------ Set up color schema---------------*/

//   var $workflow_red = "#e21b47",
//       $workflow_orange = "#ef7e22",
//       $workflow_yellow = "#fac70f",
//       $workflow_green = "#66a77a",
//       $workflow_blue = "#0893c9",
//       $workflow_purple = "#8774b3";
//
//
//   /*------------------ Draw flow chart ------------------*/
//
//   var big_screen_settings= {
//     'line-width': 5,
//     'line-length': 30,
//     'text-margin': 20,
//     'font-size': 14,
//     'font-color': 'black',
//     'line-color': 'black',
//     'element-color': 'black',
//     'fill': 'white',
//     'yes-text': ' ',
//     'no-text': ' ',
//     'arrow-end': 'block',
//     'scale': 1,
//     // style symbol types
//     'symbols': {
//         'start': {
//           'font-color': $workflow_red,
//           'element-color': 'green',
//           'fill': 'yellow',
//           'font-size' : 20
//         },
//         'end':{
//           'font-color': $workflow_red,
//           'element-color': 'green',
//           'fill': 'yellow',
//           'font-size' : 20
//         }
//     },
//     // even flowstate support ;-)
//     'flowstate' : {
//         'dataMangement' : {'fill': 'white' , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_red , 'element-color' : $workflow_red },
//         'dataInput' : {'fill': 'white' , 'font-size' : 20, 'font-color' : $workflow_red , 'element-color' : $workflow_red},
//         'matrixView' : {'fill': 'white' , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_orange , 'element-color' : $workflow_orange},
//         'ruleCoordination' : {'fill': 'white', 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_green , 'element-color' : $workflow_green},
//         'ruleTitle' : {'fill': 'white' , 'font-size' : 20, 'font-color' : $workflow_green, 'element-color' : $workflow_green},
//         'ruleAction' : {'fill': 'white' , 'font-size' : 16, 'font-color' : $workflow_green, 'element-color' : $workflow_green},
//         'summary' : {'fill': 'white' , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : $workflow_blue , 'element-color' : $workflow_blue},
//         // 'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
//         // 'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
//         // 'future' : { 'fill' : '#FFFF99'},
//         //'request' : { 'fill' : 'blue'}//,
//         // 'invalid': {'fill' : '#444444'},
//         // 'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
//         // 'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
//       }
//   };
//   var small_screen_settings ={
//     'line-width': 5,
//     'line-length': 30,
//     'text-margin': 20,
//     'font-size': 14,
//     'font-color': 'black',
//     'line-color': 'black',
//     'element-color': 'black',
//     'fill': 'white',
//     'yes-text': ' ',
//     'no-text': ' ',
//     'arrow-end': 'block',
//     'scale': 0.1,
//     // style symbol types
//     'symbols': {
//         'start': {
//           'font-color': $workflow_red,
//           'element-color': 'green',
//           'fill': 'yellow',
//           'font-size' : 20
//         },
//         'end':{
//           'font-color': $workflow_red,
//           'element-color': 'green',
//           'fill': 'yellow',
//           'font-size' : 20
//         }
//     },
//     // even flowstate support ;-)
//     'flowstate' : {
//         'dataMangement' : {'fill': $workflow_red  , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_red },
//         'dataInput' : {'fill': $workflow_red , 'font-size' : 20, 'font-color' : 'white' , 'element-color' : $workflow_red},
//         'matrixView' : {'fill': $workflow_orange  , 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_orange},
//         'ruleCoordination' : {'fill': $workflow_green, 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_green},
//         'ruleTitle' : {'fill': $workflow_green , 'font-size' : 20, 'font-color' : 'white', 'element-color' : $workflow_green},
//         'ruleAction' : {'fill': $workflow_green , 'font-size' : 16, 'font-color' : 'white', 'element-color' : $workflow_green},
//         'summary' : {'fill': $workflow_blue, 'font-size' : 26, 'font-weight': 'bold', 'font-color' : 'white' , 'element-color' : $workflow_blue},
//         // 'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
//         // 'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
//         // 'future' : { 'fill' : '#FFFF99'},
//         //'request' : { 'fill' : 'blue'}//,
//         // 'invalid': {'fill' : '#444444'},
//         // 'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
//         // 'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
//       }
//   };
//
//   var chart;
//   if (chart) {
//     chart.clean();
//   }
//
//   var chart = flowchart.parse(
//         "st=>start: START:>/\n"
//         + "e=>end: END\n"
//         + "op1=>operation: Manage My Data|dataMangement:>/data\n"
//         + "op2=>operation: Matrix View|matrixView:>/matrix\n"
//         + "op3=>operation: Rule Coordination|ruleCoordination:>/rule\n"
//         + "op4=>operation: Summary|summary\n"
//         + "func1=>condition: CSV file|dataInput:>/data?id=2\n"
//         + "func2=>condition: Database|dataInput:>/data?id=3\n"
//         + "func3=>condition: plugin|dataInput\n"
//         + "ruleSet=>condition: Rules Set|ruleTitle\n"
//         + "rule1=>condition: rule 1|ruleTitle\n"
//         + "rule1run=>subroutine: run|ruleAction\n"
//         + "rule1result=>subroutine: result|ruleAction\n"
//         + "rule2=>condition: rule 2|ruleTitle\n"
//         + "rule2run=>subroutine: run|ruleAction\n"
//         + "rule2result=>subroutine: result|ruleAction\n"
//         + "rule3=>condition: rule 3|ruleTitle\n"
//         + "rule3run=>subroutine: run|ruleAction\n"
//         + "rule3result=>subroutine: result|ruleAction\n"
//         + "st->op1\n"
//         + "op1->func1\n"
//         + "func1(yes)->func2(yes)->func3(no)\n"
//         + "func1(no)->op2\n"
//         + "func2(no)->op2\n"
//         + "func3(no)->op2\n"
//         + "op2->op3\n"
//         + "op3(right)->rule1(no)->rule2(no)->rule3\n"
//         + "rule1(yes)->rule1run->rule1result(left)\n"
//         + "rule2(yes)->rule2run->rule2result(left)\n"
//         + "rule3(yes)->rule3run->rule3result(left)\n"
//         + "op3->ruleSet(no)->rule1\n"
//         + "ruleSet(yes)->op4\n"
//         + "op4->e\n");
//
//   chart.drawSVG('workflow-small-screen', small_screen_settings);
//
//   /*------------------ End work flow chart drawing ------------------*/
//
//   /*------------------ bind event to zoom button--------------------*/
//   var $floatWindowMask = $("#float-window-mask");
//   $floatWindowMask.on("click", function(){
//
//     var $workflowBigScreenWrap =$("#workflow-big-screen-wrap");
//     var $floatWindowWrap =$("#float-window-wrap");
//
//     $workflowBigScreenWrap.show();
//     $floatWindowWrap.hide();
//
//     chart.drawSVG('workflow-big-screen', big_screen_settings);
//
//   });
//
//   var $workflowBigScreenZoomin =$("#workflow-big-screen-zoomin");
//   $workflowBigScreenZoomin.on("click", function(){
//
//     var $workflowBigScreenWrap =$("#workflow-big-screen-wrap");
//     var $floatWindowWrap =$("#float-window-wrap");
//
//     $workflowBigScreenWrap.hide();
//     $floatWindowWrap.show();
//
//     chart.drawSVG('workflow-small-screen', small_screen_settings);
//
//   });
//
//   // var $floatWindowHeading =$(".float-window-heading");
//   //
//   // $floatWindowHeading.mouseenter(function(){
//   //   console.log("move in");
//   //   var isMousedown = false;
//   //   $(this).mousedown(function(e){
//   //     isMousedown = true;
//   //   })
//   //
//   //   $(this).mousemove(function(e){
//   //
//   //     if(isMousedown){
//   //       console.log(e);
//   //     }
//   //
//   //   })
//   // }).mouseleave(function(){
//   //   console.log("move out");
//   // });
//   /*------------------ draggable function--------------------------*/
//
//
// });
