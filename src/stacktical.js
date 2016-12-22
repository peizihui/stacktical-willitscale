global.__base = __dirname + '/';
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

// Set apiKey and appId paramaters
if (process.argv[2] && process.argv[3]) {
    var apiKey = new Buffer(process.argv[2]);
    var appId = new Buffer(process.argv[3]);
    logger.info("Starting Stacktical bench image with api key: " + apiKey + " applicationID: " + appId);
    } else {
    logger.error("Could not read api key and application ID as, please provide api key as parameter of the script");
};

var testId;

// Initiates a new test
bench.createTest(apiKey, appId)
.then(function(response) {
//store testid in a function
// Acquires application test parameters
//This below is in another then a level 1
    logger.info(response);
    testId = response.testId
})
.then(function() {
    bench.getParams(apiKey, appId)
    .then(function(response) {
        logger.info(response);
        var loadResults = {'points' : []};
        var application = response.params.application
        // Loop through the test parameters and run them
        for (var i in response.params.parameters) {
            var timeoutObject = setTimeout(function() {
            var concurrency = response.params.parameters[i].concurrency;
            // Runs a single test
            bench.getThroughput(application.endpoint, concurrency, 16)
                .then(function(ldresults) {
                var p = parseInt(ldresults[0][1]);
                var Xp = parseInt(ldresults[1][1]);
                loadResults.points.push({ 'p': p, 'Xp': Xp });
                //submit = {"points":[{"p":5,"Xp":27.09},{"p":10,"Xp":43.41},{"p":15,"Xp":55},{"p":20,"Xp":62.06},{"p":25,"Xp":69.3},{"p":30,"Xp":74.63},{"p":35,"Xp":78.07},{"p":40,"Xp":80.05}]};
                bench.loadSubmit(p, Xp);
                for (var loadTest in app) {
                    iterateload(null,loadTest);
                }
                logger.info(submit);

                });
               clearTimeout(timeoutObject);
            },2000);
        }
    })
    // TODO Can do .then after a for loop?
    .then(function(loadResults) {
        bench.reportSubmit(submit).catch(function(reason) {
                logger.info('Unable to submit this load test results :' + reason);
        });
    })
})
