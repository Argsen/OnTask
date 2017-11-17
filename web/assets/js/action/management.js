$(document).ready(function() {

  $(document).ajaxStart(function() {
    var $loading = $(".loading");
    $loading.show();
  })

  $(document).ajaxStop(function() {
    var $loading = $(".loading");
    $loading.hide();
  })

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

  /*-------------------- ajax to get all rules----------------------------------*/
  $.ajax({
    type: 'POST',
    url: 'rule/getAll',
    dataType: 'json',
    error: function(response){
      checkToken(response);
    },
    success: function(response) {

      switch (response.status) {
        case "error":
          var $ruleManagementList = $("#rule-management-list");
          $ruleManagementList.empty();
          break;
        case "success":
          var $ruleManagementList = $("#rule-management-list");
          $ruleManagementList.empty();

          var length = response.data.length;
          while (length--) {
            createRuleList($ruleManagementList, response.data[length], function(res){
              bindRuleListEvent(res);
            });
          }

          break;
        default:

      }

    }
  });

  /*------------------- create new rule-----------------------------------------*/
  $createNewRule = $("#create-new-rule");
  $createNewRule.on("click", function(){
    var $ruleCreateModal = $("#rule-create-modal");
    $ruleCreateModal.modal();

    var $newRuleName = $("#new-rule-name");
    var $newRuleDescription = $("#new-rule-description");
    var $createRuleBtn =$("#create-rule-btn");
    var $cancelCreateRuleBtn = $("#cancel-create-rule-btn");

    $newRuleName.focus();

    $createRuleBtn.on("click", function(){
      $.ajax({
        type: 'POST',
        url: 'rule/create',
        dataType: 'json',
        data: {
          name: $newRuleName.val(),
          description: $newRuleDescription.val()
        },
        error: function(response){
          checkToken(response);
        },
        success: function(response){
          if(response.status === 'success'){
            window.location.reload();
          }else{
            console.log("Not able to create");
          }
        }
      });
    });

    $cancelCreateRuleBtn.on("click", function(){
        $.modal.close();
        window.location.reload();
    });

  });



});

/*--------------------- navigation funcitons -----------------------------------*/
var nav = function(element, url) {
  element.on("click", function() {
    window.location = url;
  });
};

var createRuleList = function(rootElement, data, callback){

  var div = $("<div class=\"1/4 grid__cell\">"
  +"<div class=\"col-style\">"
  +"<div class=\"workflow-layout\">"
  +"<div class=\"workflow-layout-2-wrapper\">"
  +"<div class=\"workflow-content\">"
  +"<div class=\"name\"></div>"
  +"<div class=\"description\"></div>"
  +"<div class=\"grid\">"
  +"<div class=\"1/2 grid__cell\"><button class=\"btn btn-green btn-margin\" id=\"edit_" + data.id + "\"><span><i class=\"fa fa-file-text\" aria-hidden=\"true\"></i> &nbsp;Edit </span></button></div>"
  +"<div class=\"1/2 grid__cell\"><button class=\"btn btn-green btn-margin\" id=\"delete_" + data.id + "\"><span><i class=\"fa fa-trash\" aria-hidden=\"true\"></i> &nbsp;Delete </span></button></div>"
  +"<div class=\"1/2 grid__cell\"><button class=\"btn btn-green btn-margin\" id=\"notification_" + data.id + "\"><span><i class=\"fa fa-share-alt-square\" aria-hidden=\"true\"></i> &nbsp;Summary</span></button></div>"
  +"<div class=\"1/2 grid__cell\"><button class=\"btn btn-green btn-margin\" id=\"export_" + data.id +"\"><span><i class=\"fa fa-share\" aria-hidden=\"true\"></i> &nbsp;Export </span></button></div>"
  +"</div>"
  +"</div>"
  +"</div>"
  +"</div>"
  +"</div>"
  +"</div>");

  rootElement.append(div);

  div.find(".name").text(data.name);
  div.find(".description").text(data.description);

  var callbackData = [data.id, "edit_" + data.id, "delete_" + data.id, "notification_" + data.id,"export_" + data.id]

  return callback(callbackData);
}

var bindRuleListEvent = function(data){
  /*---------------[0] is id, other is ["edit_1", "delete_1", "notification_1", "export_1"]------*/

  /*----------------------edit---------------------------*/
  $("#"+ data[1]).on("click", function(){
    window.localStorage.setItem("current_rule_id", data[0]);

    var ruleId = window.localStorage.getItem("current_rule_id");
    if(ruleId == null || ruleId == ""){
      console.log("no rule id");
    }else{
      console.log(ruleId);
      window.location.href = '/editRule';
    }

  });

  /*----------------------delete---------------------------*/
  $("#"+ data[2]).on("click", function(){

    var $deleteRuleModal = $("#delete-rule-modal");
    $deleteRuleModal.modal();

    var $confirmDelete = $("#confirm-delete");
    var $exitDelete = $("#exit-delete");

    $confirmDelete.on("click", function(){
      $.ajax({
        type: 'POST',
        url: 'rule/delete',
        dataType: 'json',
        data: {
          ruleId: data[0]
        },
        error: function(response){
          checkToken(response);
        },
        success: function(response){

          if(response.status === "success"){
            window.location.reload();
          }else{
            alert("Fails to delete.")
          }
        }
      });
    });

    $exitDelete.on("click", function(){
      $.modal.close();
    });

  });

  $("#"+ data[3]).on("click", function(){

    window.location.href = '/ruleNotification';

  });

  $("#" + data[4]).on('click', function () {
    var type = '';
    if (confirm('Export include matrix and data source?')) {
      type = 'include';
    } else {
      type = 'exclude';
    }
    console.log(type);
    console.log(data[0]);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
          var blob = new Blob([this.response], {type: 'application/zip'});
          var fileName = "ontask_rule.zip";
          saveAs(blob, fileName);
      }
    }
    var params = 'type=' + type + '&ruleId=' + data[0];
    xmlHttp.open('POST', 'rule/export', true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.responseType = 'arraybuffer';
    xmlHttp.send(params);
  });
}
