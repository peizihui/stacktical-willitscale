var jwt = require('jwt-simple');
var checkUser = require('../../routes/v1/users/users').checkUser;

module.exports = function(req, res, next) {

    // Getting token and key information from the API consumer headers
    var token = req.headers['x-access-token'];
    var key = req.headers['x-key'];

    if (token && key) {
        try {

            // We decode the frontend x-access-token against the backend secret
            var decodedToken = jwt.decode(token, require('../config/secret.js')());

            // Is is still valid? We're missing a token refresh mechanism here
            if (decodedToken.exp <= Date.now()) {
                res.status(401);
                res.json({
                    'status': 401,
                    'error': true,
                    'message': 'Token expired.'
                });
                return;
            }

            // We check that the access key is a valid username
            checkUser(key, function(email) {
                var accessKey = email;
                if (accessKey) {
                    next();
                } else {
                    res.status(401);
                    res.json({
                        'status': 401,
                        'error': true,
                        'message': 'Invalid user.'
                    });
                    return;
                }
            });

        } catch (error) {
            res.status(500);
            res.json({
                'status': 500,
                'error': true,
                'message': 'Something went wrong.',
                'error': error
            });
        }
    } else {
        res.status(401);
        res.json({
            'status': 401,
            'error': true,
            'message': 'Invalid token or key.'
        });
        return;
    }
};
