$(document).ready(function() {

  /*----------------------- modal function-----------------------------------*/

  var $createWorkflowBtn = $("#create-workflow-btn");
  var $cancelCreateWorkflowBtn = $("#cancel-create-workflow-btn");

  $createWorkflowBtn.on("click", function() {

    var $newWorkflowName = $("#new-workflow-name");
    var $newWorkflowDescription = $("#new-workflow-description");

    if ($newWorkflowName.val() === '' && $newWorkflowDescription.val() === '') {
      var $overviewCreateError = $("#overview-create-error");
      $overviewCreateError.hide();
      $overviewCreateError.show();
    } else {
      $.ajax({
        type: 'POST',
        url: 'workflow/create',
        dataType: 'json',
        data: {
          name: $newWorkflowName.val(),
          description: $newWorkflowDescription.val()
        },
        error:function(response){
          checkToken(response);
        },
        success: function(response) {
          if (response.status === 'success') {
            var $overviewCreateError = $("#overview-create-error");
            $overviewCreateError.hide();
            $.modal.close();
            var $overviewList = $("#overview-list");
            $.ajax({
              type: 'POST',
              url: 'workflow/getAll',
              dataType: 'json',
              error:function(response){
                checkToken(response);
              },
              success: function(response) {
                $overviewList.empty();
                var i = response.data.length;
                while (i--) {
                  insertWorkflowList($overviewList, response.data[i]);
                }
              }
            });
          } else {
            var $overviewCreateError = $("#overview-create-error");
            $overviewCreateError.hide();
            $overviewCreateError.show();
          }
        }
      });
    }

  });

  $cancelCreateWorkflowBtn.on("click", function() {

    $.modal.close();

    var $overviewList = $("#overview-list");
    $.ajax({
      type: 'POST',
      url: 'workflow/getAll',
      dataType: 'json',
      error:function(response){
        checkToken(response);
      },
      success: function(response) {
        $overviewList.empty();
        var i = response.data.length;
        while (i--) {
          insertWorkflowList($overviewList, response.data[i]);
        }
      }
    });
  });

  /*----------------------insert userid = XX workflow ------------------------*/

  var $overviewList = $("#overview-list");
  $.ajax({
    type: 'POST',
    url: 'workflow/getAll',
    dataType: 'json',
    error:function(response){
      checkToken(response);
    },
    success: function(response) {
      $overviewList.empty();
      var i = response.data.length;
      while (i--) {
        insertWorkflowList($overviewList, response.data[i]);
      }
    }
  });

  /*------------------ grab ontask user info from local storage-------------------------*/
  var onTaskInfo = JSON.parse(window.localStorage.getItem('onTaskInfo'));

  var $overviewSubHeading = $("#notification-sub-heading");
  if (onTaskInfo != null) {

    var $redirectHeading = $("#redirect-heading");
    $redirectHeading.hide();

  }

  var $overviewSubHeading = $("#overview-sub-heading");
  if (onTaskInfo != null) {
    $overviewSubHeading.empty();
    var div = $("<div class='1/4 grid__cell overview-sub'> " +
      "<span class='overview-new-workflow-style' id='createNewWorkflow'><img src=\"/images/home/plus.png\">&nbsp; &nbsp;New workflow</span></div>"+
      "<div class=\"3/4 grid__cell overview-sub overview-input\" style=\"text-align:right;\"><span><input type=\"text\" placeholder=\"search by name\" id=\"overview-search\"/>"
      +"<button type=\"button\" class=\"overview-search-button\" id=\"overview-search-button\"><i class=\"fa fa-search\" aria-hidden=\"true\"></i></button>"
      +"</span></div>");

    $overviewSubHeading.append(div);
    var $createNewWorkflow = $("#createNewWorkflow");
    $createNewWorkflow.on("click", function(){
      $("#workflowCreate").modal();

      $newWorkflowName = $("#new-workflow-name");
      $newWorkflowName.val("");
      $newWorkflowName.focus()

      $newWorkflowDescription = $("#new-workflow-description");
      $newWorkflowDescription.val("");
    });

  } else {
    console.log("no local strorage")
  }

  /*--------------------- search function -----------------------------------------*/
  var $overviewSearch = $("#overview-search");
  var $overviewSearchButton = $("#overview-search-button");

  $overviewSearch.on("keypress", function(e){
      if(e.which === 13){
        //console.log("detect enter key press");
        $overviewSearchButton.click();
      }
  });

  $overviewSearchButton.on("click", function() {

    $.ajax({
      type: 'POST',
      url: 'workflow/getAll',
      dataType: 'json',
      error:function(response){
        checkToken(response);
      },
      success: function(response) {
        
        var re = new RegExp($overviewSearch.val(), 'i');
        var $overviewList = $("#overview-list");
        $overviewList.empty();

        var i = response.data.length;
        var trigger = 0;

        if ($overviewSearch.val() === '') {
          while (i--) {
            insertWorkflowList($overviewList, response.data[i]);
          }
        } else {
          while (i--) {

            if (response.data[i].workflow.name.search(re) != -1) {
              insertWorkflowList($overviewList, response.data[i]);
              trigger++;
            }

          }

        }

      }
    });

  });


  /*---------------------- hide change password section ----------------------*/
  //var $notificationSubHeadingSetting = $("#notification-sub-heading-setting");
  //$notificationSubHeadingSetting.hide();

  var $headingDropDownWrap = $('#heading-drop-down-wrap ul');
  $headingDropDownWrap.children().eq(0).hide();

  /*---------------------- end change password section -----------------------*/
});

var insertWorkflowList = function(element, data) {
  var div_content
  if (data.access == 'admin') {
    div_content = $("<div class='1/3 grid__cell'><div class='col-style'><div class='workflow-layout'><div class='workflow-layout-2-wrapper'><div class='workflow-content'><div class='name'></div><div class='description'></div><div class='grid'><div class='1/2 grid__cell'><button class='btn btn-green btn-margin' id='open_" + data.workflow.id + "'><span><i class='fa fa-file-text' aria-hidden='true'></i> &nbsp;Edit </span></button></div><div class='1/2 grid__cell'><button class='btn btn-green btn-margin' id='delete_" + data.workflow.id + "'><span><i class='fa fa-trash' aria-hidden='true'></i> &nbsp;Delete </span></button></div><div class='1/2 grid__cell'><button class='btn btn-green btn-margin' id='share_" + data.workflow.id + "'><span><i class='fa fa-share-alt-square' aria-hidden='true'></i> &nbsp;Share </span></button></div><div class='1/2 grid__cell'><button class='btn btn-margin btn-green' id='export_" + data.workflow.id + "'><span><i class='fa fa-share' aria-hidden='true'></i> &nbsp;Export </span></button></div></div></div></div></div></div>");
    element.append(div_content);
    div_content.find(".name").text(data.workflow.name);
    bindDeleteWorkflow($("#delete_" + data.workflow.id), data.workflow.id);
    bindShareWorkflow($("#share_" + data.workflow.id), data.workflow.id);
    bindExportWorkflow($("#export_" + data.workflow.id), data.workflow.id);
  } else {
    div_content = $("<div class='1/3 grid__cell'><div class='col-style'><div class='workflow-layout'><div class='workflow-layout-2-wrapper'><div class='workflow-content'><div class='name'></div><div class='description'></div><div class='grid'><div class='1/2 grid__cell'><button class='btn btn-green btn-margin' id='open_" + data.workflow.id + "'><span><i class='fa fa-file-text' aria-hidden='true'></i> &nbsp;Edit </span></button></div><div class='1/2 grid__cell'><button class='btn btn-disabled btn-margin' id='delete_" + data.workflow.id + "'><span><i class='fa fa-trash' aria-hidden='true'></i> &nbsp;Delete </span></button></div><div class='1/2 grid__cell'><button class='btn btn-disabled btn-margin' id='share_" + data.workflow.id + "'><span><i class='fa fa-share-alt-square' aria-hidden='true'></i> &nbsp;Share </span></button></div><div class='1/2 grid__cell'><button class='btn btn-margin btn-disabled' id='export_" + data.workflow.id + "'><span><i class='fa fa-share' aria-hidden='true'></i> &nbsp;Export </span></button></div></div></div></div></div></div>");
    element.append(div_content);
    div_content.find(".name").text(data.workflow.name + ' (Shared)');
  }
  
  div_content.find(".description").text(data.workflow.description);
  bindOpenWorkflow($("#open_" + data.workflow.id), data.workflow.id);
};


var bindOpenWorkflow = function(element, workflowId){
  element.on("click", function(){
    io.socket.post('/socket/get', {workflowId: workflowId}, function (body, JWR) {
      if (body.data == 'editing') {
        if (confirm("There is already a user editing this workflow. Press ok will enter the workflow and force the other user to leave. Are you sure?")) {
          io.socket.post('/socket/join', {workflowId: workflowId}, function (body, JWR) {
            $.ajax({
              type: 'POST',
              url: 'workflow/get',
              dataType: 'json',
              data: {workflowId: workflowId},
              error:function(response){
                checkToken(response);
              },
              success: function(response) {
                if(response.status === 'success'){
                  window.location.href = '/data';
                }else{
                  console.log("Can not pass workflow id to /data");
                }
              }
            });
          });
        }
      } else {
        io.socket.post('/socket/join', {workflowId: workflowId}, function (body, JWR) {
          $.ajax({
            type: 'POST',
            url: 'workflow/get',
            dataType: 'json',
            data: {workflowId: workflowId},
            error:function(response){
              checkToken(response);
            },
            success: function(response) {
              if(response.status === 'success'){
                window.location.href = '/data';
              }else{
                console.log("Can not pass workflow id to /data");
              }
            }
          });
        });
      }
    });
  });
}

var bindDeleteWorkflow = function(element, workflowId){

  element.on("click", function(){

    var $deleteModal = $("#deleteModal");
    $deleteModal.modal();

    var $confirmDelete = $("#confirm-delete");

    $confirmDelete.unbind();
    $confirmDelete.on("click", function(){
      $.ajax({
        type: 'POST',
        url: 'workflow/delete',
        dataType: 'json',
        data: {
          workflowId: workflowId
        },
        error:function(response){
          checkToken(response);
        },
        success: function(response){
          if(response.status === 'success'){
            window.location.href = '/overview';
          }else{
            console.log("Tech error, delete error");
          }
        }
      });
    });

    var $exitDelete = $("#exit-delete");
    $exitDelete.unbind();
    $exitDelete.on("click", function() {
      $.modal.close();
    });


  });
}

var sharedUsers = [];
var sharedWorkflowId;
var bindShareWorkflow = function (element, workflowId) {
  element.click(function () {
    $.ajax({
      type: "get",
      url: 'user/getShareList',
      dataType: 'json',
      data: {},
      error: function () {},
      success: function (response) {
        $("#share-modal").modal();
        $("#share-searchUser").empty();
        $("#share-userList").empty();
        for (var i=0; i<response.data.length; i++) {
          $("#share-searchUser").append('<option>' + response.data[i].firstName + ' ' + response.data[i].lastName + ', ' + response.data[i].email + '</option>');
        }
        $.ajax({
          type: "get",
          url: 'workflow/getShareUser',
          dataType: 'json',
          data: {workflowId: workflowId},
          error: function () {},
          success: function (response) {
            sharedUsers = [];
            if (response.data.length > 0) {
              for (var i=0; i<response.data.length; i++) {
                sharedUsers.push(response.data[i].firstName + ' ' + response.data[i].lastName + ', ' + response.data[i].email);
              }
            }
            for (var i=0; i<sharedUsers.length; i++) {
              listSharedUsers(sharedUsers[i], workflowId);
            }

            $("#share-inputUser").unbind('input');
            $("#share-confirm").unbind('click');

            $("#share-inputUser").on('input', function () {
              var val = this.value;
              if($('#share-searchUser').find('option').filter(function(){
                  return this.value.toUpperCase() === val.toUpperCase();        
              }).length) {
                //send ajax request
                if (sharedUsers.indexOf(val) < 0) {
                  sharedUsers.push(val);
                  listSharedUsers(val, workflowId);
                }
              }
            });
    
            $("#share-confirm").click(function () {
              $.ajax({
                type: "post",
                url: 'workflow/share',
                dataType: 'json',
                data: {workflowId: workflowId, sharedUsers: sharedUsers},
                error: function () {},
                success: function (response) {}
              });
            });
          }
        });
      }
    });
  });
}

var bindExportWorkflow = function (element, workflowId) {
  element.click(function () {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
          var blob = new Blob([this.response], {type: 'application/zip'});
          var fileName = "ontask_data.zip";
          saveAs(blob, fileName);
      }
    }

    var params = 'workflowId=' + workflowId;
    xmlHttp.open('POST', 'matrix/export', true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.responseType = 'arraybuffer';
    xmlHttp.send(params);
  });
}



function listSharedUsers(val, workflowId) {
  var deleteButton = $('<button>Delete</button>');
  var li = $('<li>' + val + '</li>');
  $("#share-userList").append(li);
  li.append(deleteButton);
  deleteButton.click(function () {
    $.ajax({
      type: "post",
      url: 'workflow/deleteShare',
      dataType: 'json',
      data: {workflowId: workflowId, sharedUser: val},
      error: function () {},
      success: function (response) {
        sharedUsers.splice(sharedUsers.indexOf(val),1);
        li.remove();
      }
    });
  });
}