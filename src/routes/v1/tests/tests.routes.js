var tests = require('./tests.js');

/**********
* Routing *
**********/

var express = require('express');
var router = express.Router();
var authProtected = require('../../../middleware/auth/auth.middleware');

// Protected
router.post('/run', tests.getThroughput, authProtected);

module.exports = router;
