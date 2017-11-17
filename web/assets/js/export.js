/**
 * Created by Harry on 9/12/2016.
 */

var exportFile = (function () {
  var module = {};

  module.export = function (data, url, type, cb) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        return cb(this.response, xmlHttp.getResponseHeader("Content-Type"));
      }
    }

    var params = 'type=' + type + '&data=' + encodeURIComponent(JSON.stringify(data));
    xmlHttp.open('POST', url, true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.responseType = 'arraybuffer';
    xmlHttp.send(params);
  };

  return module;
}());
