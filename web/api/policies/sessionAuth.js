/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

const express = require('express');
const querystring = require('querystring');
const http = require('http');
const app = express();

module.exports = function(req, res, next) {
  let token = req.signedCookies.token;

  if (token) {
    let data = JSON.stringify({
      token: token
    });
    let options = {
      hostname: '127.0.0.1',
      port: 8088,
      path: '/verify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    let req = http.request(options, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        if (JSON.parse(chunk).isvalid) {
          return next();
        } else {
          return res.badRequest({
            msg: 'Token expires.'
          });
        }
      });
    });

    req.write(data);
    req.end();
  } else {
    return res.badRequest({
      msg: 'Token expires.'
    });
  }

  //// User is allowed, proceed to the next policy,
  //// or if this is the last policy, the controller
  //if (req.session.authenticated) {
  //  return next();
  //}
  //
  //// User is not allowed
  //// (default res.forbidden() behavior can be overridden in `config/403.js`)
  //return res.forbidden('You are not permitted to perform this action.');
};
