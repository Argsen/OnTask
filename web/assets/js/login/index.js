$("#login").click(function () {
  $.ajax({
    type: 'POST',
    url: 'user/login',
    dataType: 'json',
    data: {
      'email': $("#regemail").val(),
      'password': $("#regpassword").val()
    },
    error:function(response){
      checkToken(response);
    },
    success: function(response) {
      if (response.status == 'success') {
        window.location.href = '/overview';
        window.localStorage.setItem('onTaskInfo', JSON.stringify(response.data));
      }else{
        console.log("Technical Error.")
      }
    }
  });
});

$("#home").click(function () {
  window.location.href = '/';
});
