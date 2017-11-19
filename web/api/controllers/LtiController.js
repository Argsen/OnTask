/**
 * Controller to process LTI login requests
 */

const oauthSignature = require('oauth-signature');

module.exports = {
  login: (req, res) => {
    const capturedParams = Object.assign({}, req.body);
    const ltiUrl = sails.config.constant.lti.url;
    const ltiKey = sails.config.constant.lti.key;
    const ltiSecrect = sails.config.constant.lti.secrect;
    const requestKey = capturedParams.oauth_consumer_key;
    const requestSignature = capturedParams.oauth_signature;
    
    // check if it is a valid LTI Consumer
    if (requestKey !== ltiKey) {
      return res.status(400).send('Invalid LTI launch request.');
    }

    // delete oauth_signature before generating the signature
    delete capturedParams.oauth_signature;

    const signature = oauthSignature.generate(
      'POST',
      ltiUrl,
      capturedParams,
      ltiSecrect,
      null,
      { encodeSignature: false }
    );

    // check if it is a valid LTI request
    if (signature !== requestSignature) {
      return res.status(400).send('Invalid LTI launch request.');
    }

    // pass oauth signature test, perform login process
    // for (const a in capturedParams) {
    //   console.log(`${a}: ${capturedParams[a]}`);
    // }

    const role = capturedParams.roles.indexOf(sails.config.constant.lti.admin) > -1 ? 1 :
      capturedParams.roles.indexOf(sails.config.constant.lti.instructor) > -1 ? 2 : 3;
    UserService.loginLTI({
      email: capturedParams.lis_person_contact_email_primary,
      firstName: capturedParams.lis_person_name_given,
      lastName: capturedParams.lis_person_name_family,
      role: role
    }, (err, user) => {
      if (err || !user || !user.token) {
        return res.status(500).send('Server temporarily unavailable.');
      }

      const cookie = user.token;
      res.cookie("token", cookie, {
        maxAge: 604800000,
        httpOnly: true,
        signed: true
      });
      req.session.sUserId = user.user.id;
      // delete user.user.password;

      switch (user.user.role) {
        case 3:
          return res.redirect('student');
          break;
        case 1:
        case 2:
        default:
          res.redirect('overview');
          break;
      }
    });
  }
}