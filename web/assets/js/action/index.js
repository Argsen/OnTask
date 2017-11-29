$(document).ready(function() {

  /*---------------- modify redirect a to /action------------------------------*/
  var $redirectHeading = $("#redirect-heading");
  $redirectHeading.attr("href", "/action");

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

  /*--------------- bind verify condition function----------------------------*/
  $(".action-left-section").mouseover(function(){
    inputCondition(function (err, ele) {
      if (err) {
        ele.find('.conditionName').val('');
        checkModal("Notice!", err);
      } else {
      //  verifiedModal("Verify Condition", "Dear User, your conditions have been verified!");
      }
    });
  })

  $(".action-left-section").hover(function() {
    inputCondition(function (err, ele) {
      if (err) {
        ele.find('.conditionName').val('');
        checkModal("Notice!", err);
      } else {
      //  verifiedModal("Verify Condition", "Dear User, your conditions have been verified!");
      }
    });
  }, function() {
    inputCondition(function (err, ele) {
      if (err) {
        ele.find('.conditionName').val('');
        checkModal("Notice!", err);
      } else {
      //  verifiedModal("Verify Condition", "Dear User, your conditions have been verified!");
      }
    });
  })

  $(document).mousemove(function( event ) {

    $(".conditionName").each(function(){
      var value = $(this).val();
      if(value === ""){
        $(this).addClass("conditionError");
      }else{
        $(this).removeClass("conditionError");
      }
    })

  });

  // $(".action-left-section").hover(function(){
  //   inputCondition(function (err) {});
  // },function(){
  //   inputCondition(function (err) {});
  // })

});

var nav = function(element, url) {
  element.on("click", function() {
    window.location = url;
  });
}

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

var checkModal = function(heading, content){
  var $verifiedModalHeading = $("#check-modal-heading");
  var $verifiedModalContent = $("#check-modal-content");

  $verifiedModalHeading.text("");
  $verifiedModalContent.text("");

  $verifiedModalHeading.text(heading);
  $verifiedModalContent.text(content);

  var $verifiedModal = $("#check-modal");
  $verifiedModal.modal();
};

//------------ jquery text editor ---------------

tinymce.init({ menubar:false, selector:'#ruleAction', height: 500 });

// --------------------- Rule -------------------------------------

var ruleColumns = [];
var conditions;

$("#addCondition").click(function () {
  rule.addCondition($("#conditions"), ruleColumns);
});

$("#addSuperCondition").click(function () {
  rule.addCondition($("#conditions"), ruleColumns, null, null, null, 'super condition');
  $("#addSuperCondition").hide();
});

$("#confirmCondition").click(function () {
  inputCondition(function (err) {
    if (err) {
      verifiedModal("Alert", err);
    } else {
      verifiedModal("Verify Condition", "Dear User, your conditions have been verified!");
    }
  });
});

$("#fromEmailAddress").val(JSON.parse(window.localStorage.getItem('onTaskInfo')).email);

list.getStructure('user', function (response) {
  for (var key in list.data[list.workflowDB]) {
    if (key == 'workflow' + list.workflowId) {
      for (var i=0; i<list.data[list.workflowDB][key].columns.length; i++) {
        ruleColumns.push(list.data[list.workflowDB][key].columns[i].Field);
        $("#selectKey").append("<option>" + list.data[list.workflowDB][key].columns[i].Field + "</option>");
      }
    }
  }
  $.ajax({
    type: 'GET',
    url: 'rule/get',
    dataType: 'json',
    data: {ruleId: window.localStorage.getItem('current_rule_id')},
    error: function(response){
      checkToken(response);
    },
    success: function (response) {
      if (response.status == 'success') {
      //  $(window).load(function () {
          if (response.data.data) {
            rule.loadCondition($("#conditions"), ruleColumns, JSON.parse(response.data.condition), JSON.parse(response.data.data).superCondition);
          }
          inputCondition(function () {});
          if (response.data.action) {
            setTimeout(function(){
              tinymce.activeEditor.setContent('');
              tinymce.activeEditor.execCommand('mceInsertContent', false, response.data.action);
            },1000)

          }
          $("#ruleName").val(response.data.name);
          $("#ruleDescription").val(response.data.description);
          if (response.data.data) {
            $("#emailSubject").val(JSON.parse(response.data.data).emailSubject);
            if (JSON.parse(response.data.data).fromEmailAddress) {
              $("#fromEmailAddress").val(JSON.parse(response.data.data).fromEmailAddress);
            }
          }
          if (response.data.schedule) {
            var schedule = response.data.schedule.split(" ");
            $(".ontask-clock input").val(schedule[1] + ":" + schedule[0]);
            var scheduleDay = schedule[4].split(",");

            for(var item in scheduleDay){

              switch (scheduleDay[item]) {
                case "0":
                  $(".rule-schedule-wrap ul li").eq(0).find("input").prop("checked", true);
                  break;
                case "1":
                  $(".rule-schedule-wrap ul li").eq(1).find("input").prop("checked", true);
                  break;
                case "2":
                  $(".rule-schedule-wrap ul li").eq(2).find("input").prop("checked", true);
                  break;
                case "3":
                  $(".rule-schedule-wrap ul li").eq(3).find("input").prop("checked", true);
                  break;
                case "4":
                  $(".rule-schedule-wrap ul li").eq(4).find("input").prop("checked", true);
                  break;
                case "5":
                  $(".rule-schedule-wrap ul li").eq(5).find("input").prop("checked", true);
                  break;
                case "6":
                  $(".rule-schedule-wrap ul li").eq(6).find("input").prop("checked", true);
                  break;
                default:

              }

            }
          }
      //  });

        if (response.data.condition && Object.keys(JSON.parse(response.data.condition)).length) {
          //$("#confirmCondition").show();
        }
        if (response.data.data) {
          $(".notificationType").each(function () {
            if ($(this).attr('value') == 'email') {
              if (JSON.parse(response.data.data).notificationType.email) {
                $(this).prop('checked', true);
              } else {
                $(this).prop('checked', false);
              }
            }
            if ($(this).attr('value') == 'notification') {
              if (JSON.parse(response.data.data).notificationType.notification) {
                $(this).prop('checked', true);
              } else {
                $(this).prop('checked', false);
              }
            }
          });
        }
      }
    }
  });
});

var customAttributes = {};
$.ajax({
  type: 'POST',
  url: 'workflow/get',
  dataType: 'json',
  data: {},
  error: function(response){
    checkToken(response);
  },
  success: function (response) {
    if (response.status == 'success') {
      if (response.data.data && JSON.parse(response.data.data).customAttributes) {
        customAttributes = JSON.parse(response.data.data).customAttributes;
        for (var key in customAttributes) {
          $("#selectCustomAttribute").append('<option value="' + customAttributes[key] + '">' + key + '</option>');
        }
      }
    }
  }
});

$("#insertKey").click(function () {
  tinymce.activeEditor.execCommand('mceInsertContent', false, '{{' + $("#selectKey").val() + '}}');
});

$("#insertCondition").click(function () {
  tinymce.activeEditor.execCommand('mceInsertContent', false, '{{' + $("#selectCondition").val().split(' : ')[1] + ':' + $("#selectBoolean").val() + '} : { Insert condition text here }}');
});

$("#insertCustomAttribute").click(function () {
  tinymce.activeEditor.execCommand('mceInsertContent', false, '{{custom-' + $("#selectCustomAttribute option:selected").text() + '}}');
});

var ruleData = {
  notificationType: {
    email: true,
    notification: false
  },
  superCondition: '',
  emailSubject: '',
  fromEmailAddress: ''
};


$("#saveRule").click(function() {
  //------trigger schedule--------------------
  var $ruleScheduleToggle = $("#rule-schedule-toggle");

  $ruleScheduleToggle.trigger("click");

  ruleData.emailSubject = $("#emailSubject").val();
  ruleData.fromEmailAddress = $("#fromEmailAddress").val();

  $.ajax({
    type: 'POST',
    url: 'rule/create',
    dataType: 'json',
    data: {name: $("#ruleName").val(), condition: JSON.stringify(conditions), action: tinymce.activeEditor.getContent(), schedule: $("#ruleSchedule").val(), description: $("#ruleDescription").val(), data: JSON.stringify(ruleData)},
    error: function(response){
      checkToken(response);
    },
    success: function (response) {
      if (response.status == 'success') {

        verifiedModal("New rule has been saved", "Hi, you have save a new rule, please check it in rule management page, Thanks!");

      }
    }
  });

});

var inputCondition = function(cb){
  $("#selectCondition").empty();
  var parseResult = rule.parseCondition();
  if (parseResult.error) {
    return cb(parseResult.error, parseResult.ele);
  }
  conditions = parseResult.conditions;
  ruleData.superCondition = parseResult.superCondition;
  var num = 0;
  for (var key in conditions) {
    if (key != parseResult.superCondition) {
      if (conditions[key].length > 0) {
        num++;
        var option = $('<option></option>');
        option.text(num + ' : ' + key);
        //$("#selectCondition").append('<option>Condition' + num + ' : ' + key + '</option>');
        $("#selectCondition").append(option);
      }
    }
  }
  return cb();
}

var runSave = function(callback){
  //------trigger schedule--------------------
  var $ruleScheduleToggle = $("#rule-schedule-toggle");

  $ruleScheduleToggle.trigger("click");

  $(".notificationType").each(function () {
    if ($(this).attr('value') == 'email') {
      if ($(this).is(':checked')) {
        ruleData.notificationType.email = true;
      } else {
        ruleData.notificationType.email = false;
      }
    }
    if ($(this).attr('value') == 'notification') {
      if ($(this).is(':checked')) {
        ruleData.notificationType.notification = true;
      } else {
        ruleData.notificationType.notification = false;
      }
    }
  });

  ruleData.emailSubject = $("#emailSubject").val();
  ruleData.fromEmailAddress = $("#fromEmailAddress").val();
  if (!tinymce.activeEditor.getContent()) {
    return callback("error");
  }
  $.ajax({
    type: 'POST',
    url: 'rule/update',
    dataType: 'json',
    data: {ruleId: window.localStorage.getItem('current_rule_id'), name: $("#ruleName").val(), condition: JSON.stringify(conditions), action: tinymce.activeEditor.getContent(), schedule: $("#ruleSchedule").val(), description: $("#ruleDescription").val(), data: JSON.stringify(ruleData)},
    error: function(response){
      checkToken(response);
    },
    success: function (response) {
      if (response.status == 'success') {

      //  verifiedModal("OnTask Rule Section", "Rule update successfully!");

        return callback("success");

      }
    }
  });
}

$("#actionSubmit").click(function () {
  inputCondition(function () {});
  runSave(function(message){
    if(message === 'success'){
      verifiedModal("OnTask Rule Section", "Rule update successfully!");
    } else {
      verifiedModal("Notice!", 'Please add content in email template.');
    }
  });
});

$("#runTest").click(function () {
  inputCondition(function () {});
  runSave(function(message){

    if(message === 'success'){
      if (ruleColumns.indexOf('email') < 0) {

        verifiedModal("Notice!", 'Please add an email column to my data (column name: "email" case sensitive)');

      } else {
        $.ajax({
          type: 'POST',
          url: 'rule/run',
          dataType: 'json',
          data: {ruleId: window.localStorage.getItem('current_rule_id'), customAttributes: customAttributes, runType: 'test'},
          error: function (response) {

            checkToken(response);
            verifiedModal("Notice!", JSON.parse(response.responseText).msg);

          },
          success: function (response) {
            if (response.status == 'success') {

              verifiedModal("Success!", "Rule test finished. Results available in the rule sumamry");

            }

          }
        });
      }
    } else {
      verifiedModal("Notice!", 'Please add content in email template.');
    }
  });

});

$("#runRule").click(function () {
  runSave(function(message){
    if(message === 'success'){
      if (ruleColumns.indexOf('email') < 0 && ruleColumns.indexOf('Email') < 0) {

        verifiedModal("Notice!", 'Please add an email column to my data (column name: "email" or "Email")');

      } else {
        $.ajax({
          type: 'POST',
          url: 'rule/run',
          dataType: 'json',
          data: {ruleId: window.localStorage.getItem('current_rule_id'), customAttributes: customAttributes, runType: 'created'},
          error: function (response) {

            checkToken(response);
            verifiedModal("Notice!", JSON.parse(response.responseText).msg);

          },
          success: function (response) {
            if (response.status == 'success') {

              verifiedModal("Success!", response.data);

            }
          }
        });
      }
    } else {
      verifiedModal("Notice!", 'Please add content in email template.');
    }
  });
});
