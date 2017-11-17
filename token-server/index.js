const fs = require('fs');
const restify = require('restify');
const jwt = require('jsonwebtoken');

const privateKey = fs.readFileSync('./key/jwtRS256.key');
const publicKey = fs.readFileSync('./key/jwtRS256.key.pub');

const config = {
  port: 8088,
  algorithm: 'RS256',
  issuer: 'ontask',
  subject: 'USR-CERT',
  audience: 'ontask',
  expires_time: '7d'
};

const server = restify.createServer();
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: false }));
server.use(restify.plugins.bodyParser({ mapParams: false }));

server.get('/hello/:name', (req, res, next) => {
  res.send('hello ' + req.params.name);
  next();
});

server.post('/sign', (req, res, next) => {
  const user = req.body.user;
  const role = req.body.role;
  if (user && role) {
    const payload = {
      user: user,
      role: role
    }
    jwt.sign(payload, privateKey, {
      algorithm: config.algorithm,
      issuer: config.issuer,
      subject: config.subject,
      audience: config.audience,
      expiresIn: config.expires_time
    }, (err, token) => {
      if (err) {
        console.trace(err);
        res.send({token: ''});
      } else {
        res.send({token: token});
      }
      next();
    });
  } else {
    res.send({token: ''});
    next();
  }
});

server.post('/verify', (req, res, next) => {
  const token = req.body.token;
  if (token) {
    jwt.verify(token, publicKey, {
      algorithm: config.algorithm,
      issuer: config.issuer,
      subject: config.subject,
      audience: config.audience,
      maxAge: config.expires_time
    }, (err, decoded) => {
      if (err) {
        console.trace(err);
        res.send({isvalid: false});
      } else {
        res.send({isvalid: true});
      }
      next();
    });
  } else {
    res.send({isvalid: false});
    next();
  }
});

server.listen(config.port, () => {
  console.log('%s listening at %s', server.name, server.url);
});
