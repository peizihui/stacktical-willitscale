/*****************
* Master Routing *
*****************/

var express = require('express');
var router = express.Router();

var tests = require('./tests/tests.routes.js');

router.use('/v1/s/tests', tests);

module.exports = router;
