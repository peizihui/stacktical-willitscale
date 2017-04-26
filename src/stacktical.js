global.__base = __dirname + '/';
var apiKey = process.env.APIKEY;
var appId = process.env.APPID;
config = require(__base + 'config/config.js')();

var logger = require(__base + 'logger/logger.winston')(module);
var Promise = require("bluebird");
var bench = require(__base + 'components/benchmark/benchmark.controller');
var reports = require(__base + 'components/reports/reports.controller');

/*
 * 1 [POST] /tests Initiate a new test
 * 2 [GET] /tests/parameters Acquire application test parameters
 * 3 [POST] /tests/:testId Submit each test iteration results
 * 4 [POST] /reports/scalability format and submit the data for a scalability report
 */

if (apiKey && appId) {
    logger.info("Starting Stacktical bench image with api key: " + apiKey + " applicationID: " + appId);
} else {
    // Exit if the Api Key and the App ID are not provided.
    logger.error("Could not read api key and application ID as, please provide api key as parameter of the script");
    process.exit(1);
};

var testId;
var devSubmit = {"points":[{"p":5,"Xp":27.09},{"p":10,"Xp":43.41},{"p":15,"Xp":55},{"p":20,"Xp":62.06},{"p":25,"Xp":69.3},{"p":30,"Xp":74.63},{"p":35,"Xp":78.07},{"p":40,"Xp":80.05}]};

// Initiates a new test
// 1 [POST] /tests Initiate a new test
bench.createTest(apiKey, appId)
.then(function(test) {
    testId = test.testId
     // 2 [GET] /tests/parameters Acquire application test parameters
    return bench.getParams(apiKey, appId)
})
.catch(function(reason) {
    // Catch bench.createTest
    logger.error(reason);
})
.then(function(test_parameters) {
    var loadResults = {'points' : []};
    var application = test_parameters.application;
    // Loop through the test parameters and run them
    //logger.info(application);
    for (var i in application.test_parameters.workload) {
        var concurrency = application.test_parameters.workload[i].concurrency;
        var duration = application.test_parameters.duration
        // Runs a single test
        bench.getThroughput(application.url, concurrency, duration)
            .then(function(ldresults) {
                var p = parseInt(ldresults[0][1]);
                var Xp = parseInt(ldresults[1][1]);
                loadResults.points.push({ 'p': p, 'Xp': Xp });
                // 3 [POST] /tests/:testId Submit each test iteration results
                bench.loadSubmit(apiKey, appId, testId, { 'p': p, 'Xp': Xp });
            })
            .catch(function(reason) {
                // Catch bench.getThroughtput
                logger.error(reason);
            });
    }
})
.catch(function(reason) {
    // Catch test parameters loop
    logger.error(reason);
})
.then(function(loadResults) {
    // 4 [POST] /reports/scalability format and submit the data for a scalability report
    bench.testSubmit(apiKey, appId, devSubmit)
        .then(function() {
            logger.info("scalability test complete");
        })
        .catch(function(reason) {
            // Catch bench.testSubmit
            logger.info('Unable to submit this load test results :' + reason);
        });
});

