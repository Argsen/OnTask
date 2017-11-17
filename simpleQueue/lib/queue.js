/**
 * Created by Harry on 25/05/2017.
 */

const kue = require('kue');
const requireDir = require('require-dir');
const dir = requireDir('../config');

const queue = {
  _queue: '',

  initial: function () {
    this._queue = kue.createQueue({
      prefix: dir.settings.redis.prefix,
      redis: {
        host: dir.settings.redis.host,
        port: dir.settings.redis.port,
        options: dir.settings.redis.options
      }
    }).on ('job complete', function (id, result) {
      kue.Job.get(id, function (err, job) {
        if (err) return;
        job.remove(function (err) {
          if (err) throw err;
        })
      });
    });
  },

  process: function (name, cb) {
    this._queue.process(name, function (job, done) {
      cb(job, done);
    });
  },

  create: function (name, data, cb) {
    let job = this._queue.create(name, data).save(function (err) {
      cb(job);
    });
  }
}

module.exports = queue;