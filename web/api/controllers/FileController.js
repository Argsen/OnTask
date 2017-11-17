/**
 * Created by Harry on 9/12/2016.
 */

var fs = require('fs');
var archiver = require('archiver');

module.exports = {
  upload: function (req, res) {
    let uploadFile = req.file('uploadFile');
    let type = req.param('type').toLowerCase();

    // temporarily only support csv file
    if (type !== 'csv') {
      return res.badRequest({
        status: 'error',
        msg: 'Please upload a csv file.'
      });
    } else {
      uploadFile.upload(function onUploadComplete (err, file) {
        if (err) {
          return res.badRequest({
            status: 'error',
            msg: err
          });
        }

        UploadService[type](file[0].fd, function (err, data) {
          if (err) {
            return res.badRequest({
              status: 'error',
              msg: err
            });
          } else {
            res.json({status: 'success', data: data, path: file[0].fd});
          }
        });
      });
    }
  },

  export: function (req, res) {
    let data = req.param('data');
    let type = req.param('type');

    ExportService[type](JSON.parse(decodeURIComponent(data)), function (err, data) {
      res.set('Content-Type', data.type);

      if (type == 'zip') {
        var zip = archiver('zip');

        zip.pipe(res);
        for (var i=0; i<data.data.length; i++) {
          zip.append(data.data[i].data, {name: data.data[i].name + '.' + data.data[i].type});
        }
        zip.finalize();
      } else {
        res.send(new Buffer(data.data));
      }
    });
  }
}
