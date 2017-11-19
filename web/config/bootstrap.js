/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {
  var roles = [
    {
    id: 1,
    role: 'admin'
    },
    {
      id: 2,
      role: 'staff'
    },
    {
      id: 3,
      role: 'student'
    }
  ];
  Role.findOrCreate(roles).exec(function (err, response) {
    //console.log(err);
    //console.log(response);
  });

  CronJobService.initial();

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
