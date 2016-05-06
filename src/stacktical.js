var express = require('express');
var https = require('https');
var fs = require('fs');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var lodash = require('lodash/core');

var app = module.exports = express();

app.use(logger('dev'));
app.use(bodyParser.json());

// CORS
app.all('/*', function(req, res, next) {

    if (!lodash.isUndefined(req.headers.origin)) {
        var origins = ['http://192.168.99.100:10000', 'https://stacktical.com'];
        for(var i = 0; i < origins.length; i++){
            var origin = origins[i];
            if(req.headers.origin.indexOf(origin) > -1){
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            }
        }
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://stacktical.com');
    }

    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Accept,X-Requested-With,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

// API routes
app.use('/', require('./routes/v1/routes'));

// API route not found
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Server options
var options = {
    ca: fs.readFileSync('/etc/ssl/certs/www_stacktical_com.pem'),
    cert: fs.readFileSync('/etc/ssl/certs/www_stacktical_com.pem'),
    key: fs.readFileSync('/etc/ssl/certs/www_stacktical_com.key')
};

// HTTPS server
https.createServer(options, app).listen(8888, function() {
    console.log('Express server listening on port 8888');
});
