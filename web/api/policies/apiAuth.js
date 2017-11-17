const auth = require('basic-auth');

module.exports = async (req, res, next) => {
    try {   
        const val = auth(req);
        const token = await Api_Token.findOne({accessKey: val.name, secretKey: val.pass});

        if (token) {
            if (token.status == 1) {
                req.options.values = req.options.values || {};
                req.options.values.tokenId = token.id
                return next();
            } else {
                return res.badRequest({
                    msg: 'Key expired.'
                });
            }
        } else {
            return res.badRequest({
                msg: 'Authentication Failed.'
            });
        }
    } catch (err) {
        console.log(err);
        return res.badRequest({
            msg: 'Authentication Failed.'
        });
    }
}