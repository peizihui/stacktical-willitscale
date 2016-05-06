var jwt = require('jwt-simple');
var uuid = require('node-uuid');

var auth = {};

auth.genToken = function(user) {
    var now = Math.floor(new Date() / 1000);
    
    var token = jwt.encode({
        iat: now,
        exp: expires,
        jti: uuid.v4(),
        iss: 'https://stacktical.com'
    }, require('../../config/secret')());

    var expires = auth.expiresIn(14);

    return {
        token: token,
        expires: expires,
        user: user
    };
};

auth.expiresIn = function(numDays) {
    var dateObject = new Date();
    return dateObject.setDate(dateObject.getDate() + numDays);
};

module.exports = auth;
