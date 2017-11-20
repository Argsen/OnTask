var currentToken;

$.ajax({
    type: "get",
    url: "workflow/getUserAll",
    dataType: "json",
    data: {},
    error: function (response) {
        console.log(response);
    },
    success: function (response) {
        for (var i=0; i<response.data.length; i++) {
        //    $("#workflowList").append('<option>ID: ' + response.data[i].workflow.id + ' - Name: ' + response.data[i].workflow.name + '</option>');
            showWorkflow($("#workflowList"), response.data[i].workflow);
        }
    }
});

$.ajax({
    type: "get",
    url: "api/getKey",
    dataType: "json",
    data: {},
    error: function (response) {
        console.log(response);
    },
    success: function (response) {
        for (var i=0; i<response.data.length; i++) {
            showKey($("#keyList"), response.data[i]);
        }
    }
});

$("#generateKey").click(function () {
    $.ajax({
        type: "post",
        url: "API/generateKey",
        dataType: "json",
        data: {},
        error: function (response) {
            console.log(response);
        },
        success: function (response) {
            showKey($("#keyList"), response.data);
        }
    });
});

$("#saveAccess").click(function () {
    var tokenAccess = [];

    $(".workflowDiv input").each(function () {
        if ($(this).prop('checked')) {
            tokenAccess.push({
                token: currentToken,
                workflow: parseInt($(this).attr('id').replace('workflow', '')),
                type: 'admin'
            });
        }
    });

    $.ajax({
        type: "post",
        url: "API/saveKeyAccess",
        dataType: "json",
        data: {token: currentToken, access: tokenAccess},
        error: function (response) {
            console.log(response);
        },
        success: function (response) {
            console.log(response);
            alert('Access Change Saved.');
        }
    });
});

function showWorkflow(div, workflow) {
    var workflowDiv = $('<div class="workflowDiv" style="border: 1px solid black; margin: 5px; padding: 5px; position: relative; height: 50px;"></div>');
    var checkbox = $('<input id="workflow' + workflow.id + '" style="position: absolute; left: 0px; top: 20px; z-index: -1;" type="checkbox" />');
//    var workflowIDSpan = $('<div style="position: absolute; left: 30px; top: 10px;">ID: ' + workflow.id + '</div>');
    var workflowNameSpan = $('<div style="position: absolute; left: 30px; top: 30px;">Name: ' + workflow.name + '</div>');

    div.append(workflowDiv);
    workflowDiv.append(checkbox);
//    workflowDiv.append(workflowIDSpan);
    workflowDiv.append(workflowNameSpan);

    workflowDiv.click(function (e) {
        if (checkbox.prop('checked')) {
            checkbox.prop('checked', false);
        } else {
            checkbox.prop('checked', true);
        }
    });
}

function showKey(div, key) {
    var status = key.status ? 'Enabled' : 'Disabled';

    var keyDiv = $('<div class="keyDiv" style="border: 1px solid black; margin: 5px; padding: 5px; position: relative;"></div>');
    var accessKeySpan = $('<div>Access Key: ' + key.accessKey + '</div>');
    var statusSpan = $('<div>Status: ' + status + '</div>');
    var refreshTokenSpan = $('<div>Refresh Token: ' + key.refreshToken + '</div>');

    var expireAtSpan = $('<div></div>');
    if (key.expireAt) {
        expireAtSpan.text('Expire At: ' + key.expireAt);
    }
    var secretKeySpan = $('<div></div>');
    if (key.secretKey) {
        secretKeySpan.text('Secret Key: ' + key.secretKey);
    }

    div.append(keyDiv);
    keyDiv.append(accessKeySpan);
    keyDiv.append(secretKeySpan);
    keyDiv.append(statusSpan);
    keyDiv.append(refreshTokenSpan);
    keyDiv.append(expireAtSpan);

    keyDiv.click(function () {
        $(".keyDiv").css('border', "1px solid black");
        keyDiv.css('border', "2px solid red");
        currentToken = key.id;
        $.ajax({
            type: "get",
            url: "API/getAccess",
            dataType: "json",
            data: {token: currentToken},
            error: function (response) {
                console.log(response);
            },
            success: function (response) {
                $('.workflowDiv input').prop('checked', false);
                for (let i=0; i<response.data.length; i++) {
                    $('#workflow' + response.data[i].workflow).prop('checked', true);
                }
            }
        });
    });
}



// import matrix zip package

$("#uploadFile").change(function() {
  var $uploadFileSpan = $("#uploadFileSpan");
  if ($("#uploadFile").val() === '') {
    console.log("upload file name is null");
  } else {
    $uploadFileSpan.empty();

    var nameArray = $("#uploadFile").val().split(/\\/);
    var position = nameArray.length;

    $uploadFileSpan.text(nameArray[position - 1]);
  }
});

$("#uploadFile_Rule").change(function() {
    var $uploadFileSpan = $("#uploadFileSpan_Rule");
    if ($("#uploadFile_Rule").val() === '') {
    console.log("upload file name is null");
    } else {
    $uploadFileSpan.empty();

    var nameArray = $("#uploadFile_Rule").val().split(/\\/);
    var position = nameArray.length;

    $uploadFileSpan.text(nameArray[position - 1]);
    }
});

$("#uploadSubmit").click(function (e) {
    e.preventDefault();

    var type = $("#uploadFile").val().split('.')[$("#uploadFile").val().split('.').length - 1];

    uploadFile.upload($('#uploadForm'), 'matrix/import', type, function(response) {
        if (response.status == 'success') {
            alert('Import success.')
        } else {
            alert('Import Error. Please try later.');
        }
    });
});

$("#uploadSubmit_Rule").click(function (e) {
    e.preventDefault();

    var type = $("#uploadFile_Rule").val().split('.')[$("#uploadFile_Rule").val().split('.').length - 1];
    uploadFile.upload($('#uploadForm_Rule'), 'rule/import', type, function(response) {
        if (response.status == 'success') {
            alert('Import success.')
        } else {
            alert('Import Error. Please try later.');
        }
    });
});
