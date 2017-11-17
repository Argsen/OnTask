/**
 * Created by Harry on 25/05/2017.
 */

const fs = require('fs');
const parse = require('csv-parse');
// unzip module has a bug:
// at lib/parse.js row 161 and 165, comment out setImmediate
const unzip = require('unzip');
const XLSX = require('xlsx');
const mysql = require('mysql');

const file = {
  upload: function (job, cb) {
    let csvData = [];

    fs.createReadStream(job.data)
      .pipe(parse({delimiter: ','}))
      .on('data', function (csvrow) {
        csvData.push(csvrow);
      })
      .on('error', function(error) {
        return cb('CSV file invalid format or data, please check the file.', '');
      })
      .on('end', function () {
        return cb(null, csvData[0]);
      });
  },

  importMatrix: function (job, cb) {
    let fileArr = [];

    fs.createReadStream(job.data)
    .pipe(unzip.Parse())
    .on('entry', async (entry) => {
      try {
        var fileName = entry.path;
        var type = entry.type; // 'Directory' or 'File'

        if (type == "File") {
          if (fileName.indexOf('/') > -1) {
            let directoryPath = fileName.split('/').splice(0,1).join('/');
            if (!fs.existsSync('output/' + directoryPath)){
              fs.mkdirSync('output/' + directoryPath);
            }
          }
          let test1 = await entry.pipe(fs.createWriteStream('output/' + fileName));
          fileArr.push('output/' + fileName);
        } else {
          entry.autodrain();
        }
      } catch (err) {
        console.log(err);
      }
    })
    .on('close', async () => {
      try {
        let result = {};

        for (let i=0; i<fileArr.length; i++) {
          let tableName = fileArr[i].split('/').pop().split('.')[0];
          result[tableName] = {};

          if (tableName == "matrix_transfer") {
            result[tableName].text = await readFileAsync(fileArr[i]);
          } else if (tableName == 'ontask_rule') {
            result[tableName].text = await readFileAsync(fileArr[i]);
          } else {
            let csvData = await csvRead(fileArr[i]);
            result[tableName].columns = csvData[0];
            result[tableName].datas = csvData;
          }
        }
        cb(null, result);
      } catch (err) {
        console.log(err);
        cb(err, null);
      }


      // Excel parse
      //
      // for (let j=0; j<fileArr.length; j++) {
      //   let tableName = fileArr[j].split('/').pop();
      //   result[tableName] = {
      //     columns: [],
      //     datas: []
      //   };
      //   console.log(fileArr[j]);
      //   let workbook = XLSX.readFile(fileArr[j]);
      //   console.log(workbook);
      //   let sheet_name = workbook.SheetNames[0];
      //   var worksheet = workbook.Sheets[sheet_name];
      //   var headers = {};
      //   var data = [];
      //   for(z in worksheet) {
      //     if(z[0] === '!') continue;
      //     //parse out the column, row, and value
      //     var tt = 0;
      //     for (var i = 0; i < z.length; i++) {
      //         if (!isNaN(z[i])) {
      //             tt = i;
      //             break;
      //         }
      //     };
      //     var col = z.substring(0,tt);
      //     var row = parseInt(z.substring(tt));
      //     var value = worksheet[z].v;

      //     //store header names
      //     if(row == 1 && value) {
      //         headers[col] = value;
      //         continue;
      //     }

      //     if(!data[row]) data[row]={};
      //     data[row][headers[col]] = value;
      //     if (result[tableName].columns.indexOf(headers[col]) < 0) {
      //       result[tableName].columns.push(headers[col]);
      //     }
      //   }
      //   //drop those first two rows which are empty
      //   data.shift();
      //   data.shift();
      //   result[tableName].datas = data;
      //   console.log(result);
      // }
    });
  }
};

module.exports = file;

function csvRead(path) {
  return new Promise((resolve, reject) => {
    let csvData = [];

    fs.createReadStream(path)
      .pipe(parse({delimiter: ','}))
      .on('data', function (csvrow) {
        if (csvData.length > 0) {
          for (let i=0; i<csvrow.length; i++) {
            csvrow[i] = mysql.escape(csvrow[i].replace(/[\\$'"]/g, "\\$&"));
          }
        }
        csvData.push(csvrow);
      })
      .on('error', function(error) {
        reject(error);
      })
      .on('end', function () {
        resolve(csvData);
      });
  });
}

function readFileAsync(path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, 'utf8', function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
