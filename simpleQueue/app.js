const nodemailer = require('nodemailer');
const queue = require('./lib/queue');
const file = require('./service/file');
const data = require('./service/data');
const requireDir = require('require-dir');
const dir = requireDir('./config');

queue.initial();
queue.process('email', function (job, done) {
  email(job.data, done);
});
queue.process('upload-csv', function (job, done) {
	file.upload(job, function (err, data) {
		if (err) {
			done(err, null);
		} else {
			done(null, data);
		}
	});
});
queue.process('upload-table', function (job, done) {
	data.query(job, function (err, data) {
		if (err) {
			done(err, null);
		} else {
			done(null, data);
		}
	});
});
queue.process('upload-matrix', function (job, done) {
	file.importMatrix(job, function (err, data) {
		if (err) {
			done(err, null);
		} else {
			done(null, data);
		}
	});
});
queue.process('upload-outSource', function (job, done) {
  data.outSource(job, function (err, data) {
    if (err) {
      done(err, null);
    } else {
      done(null, data);
    }
  });
});

function email(data, done) {
	let transporter = nodemailer.createTransport({
		host: dir.settings.email.host,
		port: dir.settings.email.port,
		secureConnection: dir.settings.email.secureConnection, // use SSL
		tls: dir.settings.email.tls,
		auth: dir.settings.email.auth
	}, {
		from: dir.settings.email.from
	});

	transporter.sendMail(data);

	setTimeout(function () {
		done();
	}, 2000);
}

console.log('Worker Queue Running. Do not close.');
