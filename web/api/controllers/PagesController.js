/**
 * Created by Harry on 12/12/2016.
 * Added by Max on 15/12/2016.
 */

module.exports = {
  temp: function (req, res) {
    return res.view('pages/temp', {layout: 'layout'});
  },

  data: function (req, res){
    let tabID = req.param("id");
    switch (tabID) {
      case '2':
          redirect(req, res, 'data/csv');
      //    return res.view('data/csv', {layout: 'layout'});
        break;
      case '3':
          redirect(req, res, 'data/database');
      //    return res.view('data/database', {layout: 'layout'});
        break;
      case '5':
          redirect(req, res, 'data/association');
      //    return res.view('data/association', {layout: 'layout'});
        break;
      default:
          redirect(req, res, 'data/index');
      //    return res.view('data/index', {layout: 'layout'});

    }

  },

  //login: function (req, res) {
  //  return res.view('login/login', {layout: 'layout'});
  //},

  action: function (req, res) {
    redirect(req, res, 'action/management');
  //  return res.view('action/management', {layout: 'layout'});
  },

  editRule: function(req, res){
    redirect(req, res, 'action/index');
  //  return res.view('action/index', {layout: 'layout'});
  },

  ruleNotification: function (req, res) {
    redirect(req, res, 'action/ruleNotification');
  //  return res.view('action/ruleNotification', {layout: 'layout'});
  },

  matrix: function (req, res){
    redirect(req, res, 'matrix/index');
  //  return res.view('matrix/index', {layout: 'layout'});
  },

  workflow: function (req, res){
    redirect(req, res, 'workflow/index');
  //  return res.view('workflow/index', {layout: 'layout'});
  },

  notification: function (req, res){
    redirect(req, res, 'notification/index');
  //  return res.view('notification/index', {layout: 'layout'});
  },

  studentNotification: function (req, res) {
    redirect(req, res, 'notification/student');
  //  return res.view('notification/student', {layout: 'layout'});
  },

  home: function (req, res){
  //  redirect(req, res, 'home/index');
    return res.view('home/index', {layout: 'layout'});
  },

  overview: function (req, res){
    if (!req.session.sUserId) return res.redirect('/');
  //  redirect(req, res, 'home/overview');
    return res.view('home/overview', {layout: 'layout'});
  },

  test: function (req, res){
    redirect(req, res, 'test/index');
  //  return res.view('test/index', {layout: 'layout'});
  },

  image: function (req, res) {
    let notificationId = Buffer.from(req.url.split('?')[1], 'base64').toString().split('=')[1];
    if (notificationId) {
      Notification.findOne(notificationId).exec(function (err, notification) {
        if (err) {

        } else {
          if (notification.read !== 'true') {
            notification.read = 'true';
            Notification.update(notification.id, notification).exec(function (err, newNo) {});
          }
        }
      });
    }

    return res.redirect('/images/1_pixel.png');
  },

  apiManagement: function (req, res) {
    redirect(req, res, 'pages/apiManagement');
  }
};

function redirect(req, res, url) {
  if (url == 'notification/student') {
    return res.view(url, {layout: 'layout'});
  }
  if (req.session.sUserId) {
    if (!req.session.sWorkflowId) {
      return res.redirect('/overview');
    }
  } else {
    return res.redirect('/');
  }
  return res.view(url, {layout: 'layout'});
}
