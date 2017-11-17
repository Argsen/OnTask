$(document).ready(function() {

  $(document).ajaxStart(function() {
    var $loading = $(".loading");
    $loading.show();
  })

  $(document).ajaxStop(function() {
    var $loading = $(".loading");

    window.setTimeout(function(){
      $loading.hide();
    },500)

  })

  /*----------------------empty local storage--------------------*/
  var onTaskInfo
  if (!window.localStorage.getItem('onTaskInfo')) {
    onTaskInfo = window.localStorage.setItem('onTaskInfo', '');
  } else {
    onTaskInfo = window.localStorage.getItem('onTaskInfo');
  }

  /*----------------------end empty local storage------------------*/

  /*----------------------login function---------------------------*/

  $(window).keyup(function(e){
    var code = e.which; // recommended to use e.which, it's normalized across browsers
    if(code==13)e.preventDefault();

    if(code==13 && $("#regemail").val() != "" && $("#regpassword").val() != ""){
      $("#login").click();
    }
  });

  $("#login").click(function() {

    if ($("#regemail").val() && $("#regpassword").val()) {
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

            if (response.data.data && JSON.parse(response.data.data).disclaimer === "accept") {
              window.location.href = '/overview';
              window.localStorage.setItem('onTaskInfo', JSON.stringify(response.data));
            } else {
              $disclaimerModal = $("#disclaimer-modal");
              $disclaimerModal.modal();

              var $disclaimerAccept = $("#disclaimer-accept");
              var $disclaimerReject = $("#disclaimer-reject");

              $disclaimerAccept.on("click", function() {

                $.ajax({
                  type: 'POST',
                  url: 'user/update',
                  dataType: 'json',
                  data: {
                    disclaimer: 'accept'
                  },
                  error:function(response){
                    checkToken(response);
                  },
                  success: function(response) {
                    window.location.href = '/overview';
                    window.localStorage.setItem('onTaskInfo', JSON.stringify(response.data[0]));
                  }
                });
              });

              $disclaimerReject.on("click", function() {
                window.location.href = '/';
              })
            }

          } else if (response.status == 'redirect') {
            window.localStorage.setItem('student', $("#regemail").val());
            window.location.href = response.data;
          }

        },
        error: function(response) {
          $errorModal = $("#error-modal");
          $errorModal.modal();
        }
      });
    } else {
      $errorModal = $("#error-modal");
      $errorModal.modal();
    }

  });
  /*----------------------login function---------------------------*/

  /*----------------------retrieve password------------------------*/

  $("#passwordRetrieve").on("click", function() {
    //$("#passwordRetrieveForm").show();
    $("#forget-password-modal").modal();
    $("#passwordRetrieveEmail").focus();
    //return false;
  });

  $("#passwordRetrieveSubmit").click(function() {
    //$("#passwordRetrieveSubmit").attr('disabled', true);
    //$("#passwordRetrieveSubmit").get(0).childNodes[0].nodeValue = 'Sending...';
    //$("#passwordRetrieveSubmit span").attr('class', 'glyphicon glyphicon-refresh glyphicon-refresh-animate');

    $.ajax({
      type: "POST",
      url: "user/retrievePassword",
      dataType: "json",
      cache: false,
      data: {
        'email': $("#passwordRetrieveEmail").val()
      },
      error:function(response){
        checkToken(response);
      },
      success: function(response) {
        if (response.status == 'success') {
          //$("#passwordRetrieveSubmit").attr('disabled', false);
          //$("#passwordRetrieveSubmit").get(0).childNodes[0].nodeValue = 'Submit';
          //$("#passwordRetrieveSubmit span").attr('class', '');

          var $alertModalHeading = $("#alert-modal-heading");
          var $alertModalContent = $("#alert-modal-content");

          $alertModalHeading.text("");
          $alertModalContent.text("");

          $alertModalHeading.text("OnTask Login");
          $alertModalContent.text(response.msg)

          var $alertModal = $("#alert-modal");
          $alertModal.modal();

          //alert(response.msg);
          //$("#signupForm").hide();
          //$("#passwordRetrieveForm").hide();
          //$("#loginForm").show();
        } else {

          var $alertModalHeading = $("#alert-modal-heading");
          var $alertModalContent = $("#alert-modal-content");

          $alertModalHeading.text("");
          $alertModalContent.text("");

          $alertModalHeading.text("OnTask Login");
          $alertModalContent.text(response.msg)

          var $alertModal = $("#alert-modal");
          $alertModal.modal();
          //alert(response.msg);
        }
      }
    });
    return false;
  });

  /*-------------------- login event bind-------------------------*/
  $("#regemail").on("keyup", function() {

    var value = $(this).val();
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (re.test(value)) {
      $(this).removeClass("error-hint");

      $(this).parent().children().eq(2).fadeTo( 100 , 0, function() {
      // Animation complete.
      });

    } else {
      if ($(this).hasClass("error-hint")) {

        $(this).parent().children().eq(2).fadeTo( 100 , 1, function() {
        // Animation complete.
        });

      } else {
        $(this).addClass("error-hint");

        $(this).parent().children().eq(2).fadeTo( 100 , 1, function() {
        // Animation complete.
        });

      }
    }



  });

  $("#regemail").focusout(function(){
    $(this).parent().children().eq(2).fadeTo( 100 , 0, function() {
    // Animation complete.
    });
  })

});
