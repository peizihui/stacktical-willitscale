global.__base = __dirname + '/';
config = require(__base + 'config/config.js')();
var Promise = require("bluebird");
var bench = require(__base + 'components/stacktical-bench.js');

/*
 * 1 [POST] /tests Initiate a new test
 * 2 [GET] /tests/parameters Acquire application test parameters
 * 3 [POST] /tests/:testId Submit each test iteration results
 * 4 [POST] /reports/scalability format and submit the data for a scalability report
 */


// Start
function stacktical() {
    bench.createTest()
    .then(function() {
        bench.getParams()
        .then(function(params) {
            console.log(params);
            //bench.iterateload(null,null,params.parameters);
            bench.iterateload();
        });

    })
    .then(function() {
        console.log("submit");
    });
};

stacktical();
