global.__base = __dirname + '/';
var apiKey = process.env.APIKEY;
var appId = process.env.APPID;
config = require(__base + 'config/config.js')();

var logger = require(__base + 'logger/logger.winston')(module);
var Promise = require('bluebird');
var benchmark = require(__base + 'components/benchmark/benchmark.controller');
var reports = require(__base + 'components/reports/reports.controller');

/*
* 1 [POST] /tests Initiate a new test
* 2 [GET] /tests/parameters Acquire application test parameters
* 3 [POST] /tests/:testId Submit each test iteration results
* 4 [POST] /reports/scalability format and submit the data for a scalability report
*/

if (apiKey && appId) {
    logger.info('Welcome to the Stacktical CI Capacity Testing application.');
} else {
    logger.error('The provided APIKEY and APPID credentials are not valid.');
    process.exit(1);
};

var testId;
var devSubmit = {"points":[{"p":5,"Xp":27.09},{"p":10,"Xp":43.41},{"p":15,"Xp":55},{"p":20,"Xp":62.06},{"p":25,"Xp":69.3},{"p":30,"Xp":74.63},{"p":35,"Xp":78.07},{"p":40,"Xp":80.05}]};

benchmark.createTest(apiKey, appId)
.then(function(test) {
    testId = test.testId;
    return benchmark.getTestsParameters(apiKey, appId);
})
.catch(function(reason) {
    logger.error(reason);
})
.then(function(testParameters) {
    var loadResults = {'points': []};
    var application = testParameters.application;

    logger.info('The following application has been identified.', application);

    var benchmarkPromises = [];
    var workloadPromises = [];

    for (i=0; i<application.test_parameters.workload.length; i++) {
        var concurrency = application.test_parameters.workload[i].concurrency;
        var duration = application.test_parameters.duration;

        benchmarkPromises.push(benchmark.getThroughput(application.url, concurrency, duration));
    }

    Promise.all(benchmarkPromises).then(function(promiseResults) {
        for(j=0; j<promiseResults.length; j++) {
            var p = parseInt(promiseResults[j][0][1]);
            var Xp = parseInt(promiseResults[j][1][1]);
            var point = {'p': p, 'Xp': Xp};
            loadResults.points.push(point);

            workloadPromises.push(benchmark.loadSubmit(apiKey, appId, testId, point));
        }
    }).catch(function(reason) {
        logger.error('One of your tests has failed!', reason);
    }).then(function() {
        return Promise.all(workloadPromises).then(function(workloadResults) {
            logger.info('All your test iterations have been successfully saved.', workloadResults);
        });
    }).catch(function(reason) {
        logger.error('One of our attempts to save a test iteration has failed!', reason);
    });
})
.catch(function(reason) {
    logger.error(reason);
})
.then(function(loadResults) {
    reports.getScalability(apiKey, appId, devSubmit)
        .then(function() {
            logger.info('Congratulations! Your capacity test is complete. Please go to Stacktical.com to see the results.');
        })
        .catch(function(reason) {
            logger.info('I was not able to proceed with your capacity test...', reason);
        });
});
