/**
 * Created by Harry on 13/12/2016.
 */

var json2csv = require('json2csv');
var pdf = require('html-pdf');
let XLSX = require('xlsx');

var exports = {
  csv: function (data, cb) {
    var fields = [];

    for (var i=0; i<data.length; i++) {
      for (var key in data[i]) {
        if (i==0) {
          fields.push(key);
        }
      }
    }

    var csv = json2csv({data: data, fields: fields});
    console.log(fields);
    return cb(null, {type: 'text/csv', data: csv});
  },

  pdf: function (data, cb) {
    var options = {
      format: 'A4',
      "border": {
        "top": "5mm",            // default is 0, units: mm, cm, in, px
        "right": "10mm",
        "bottom": "5mm",
        "left": "10mm"
      },
      "header": {
        "height": "20mm",
        "contents": ''
      },
      "footer": {
        "height": "20mm",
        "contents": {
          default: '', // fallback value
        }
      }
    }

    pdf.create(data, options).toBuffer(function(err, buffer) {
      if (err) return console.log(err);

      return cb(null, {type: 'application/pdf', data: buffer});
    });
  },

  xlsx: function (data, cb) {
    let wb = { SheetNames:[], Sheets:{} };
    let ws = XLSX.utils.json_to_sheet(data);

    wb.SheetNames.push('data');
    wb.Sheets['data'] = ws;

    let buffer = XLSX.write(wb, {bookType: 'xlsx', type: 'buffer', bookSST: false});

    return cb(null, {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', data: buffer});
  },

  txt: function (data, cb) {
    let content = new Buffer(data);

    return cb(null, {type: 'text/plain', data: content});
  },

  xml: function (data, cb) {

    return cb(null, data);
  },

  json: function (data, cb) {

    return cb(null, data);
  },

  zip: function (data, cb) {
    var temp = [];

    for (var i=0; i<data.length; i++) {
      zip(data, i, temp, cb);
    }
  }
}

module.exports = exports;

function zip(data, i, temp, cb) {
  exports[data[i].type](data[i].data, function (err, response) {
    temp.push({
      data: response.data,
      name: data[i].name,
      type: data[i].type
    });
    if (temp.length == data.length) {
      return cb(null, {type: 'application/zip', data: temp});
    }
  });
}
