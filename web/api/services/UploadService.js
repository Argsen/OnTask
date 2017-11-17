/**
 * Created by Harry on 13/12/2016.
 */

const fs = require('fs');
const parse = require('csv-parse');
const queue = sails.config.globals.queue;

module.exports = {
  csv: function (path, cb) {
    let job = queue.create(sails.config.constant.upload.csv, path).save(function (err) {
      if (err) console.log(job.id + ' error');
    });

    job.on('complete', function (result) {
      return cb(null, result);
    }).on('failed attempt', function(errorMessage, doneAttempts){
      console.log('Job failed');
    }).on('failed', function(errorMessage){
      console.log('Job failed');
    }).on('progress', function(progress, data){
      console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data );
    });
  },

  pdf: function (data, cb) {

    return cb(null, data);
  },

  xlsx: function (data, cb) {

    return cb(null, data);
  },

  xml: function (data, cb) {

    return cb(null, data);
  },

  json: function (data, cb) {
    return cb(null, data);
  },

  zip: function (path, cb) {
    let job = queue.create(sails.config.constant.upload.matrix, path).save(function (err) {
      if (err) console.log(job.id + ' error');
    });

    job.on('complete', function (result) {
      return cb(null, result);
    }).on('failed attempt', function(errorMessage, doneAttempts){
      console.log('Job failed');
    }).on('failed', function(errorMessage){
      console.log('Job failed');
    }).on('progress', function(progress, data){
      console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data );
    });
  }
}
