/**
 * Created by Harry on 12/12/2016.
 */


var uploadFile = (function () {
  var module = {};

  module.upload = function (ele, url, type, cb) {
    var tempInput = $('<input type="hidden" name="type" />');
    ele.prepend(tempInput);
    tempInput.val(type);
    var formData = new FormData(ele[0]);

    $.ajax({
      type: 'POST',
      url: url,
      dataType: 'json',
      data: formData,
      beforeSend: function () {},
      success: function (response) {
        tempInput.remove();
        return cb(response);
      },
      error: function (response) {
        checkToken(response);
        tempInput.remove();
        alert(JSON.parse(response.responseText).msg);
        return cb(response);
      },
      cache: false,
      contentType: false,
      processData: false
    });
  };

  return module;
}());
