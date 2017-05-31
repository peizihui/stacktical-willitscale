global.__base = __dirname + '/';
var apiKey = process.env.STACKTICAL_APIKEY;
var appId = process.env.STACKTICAL_APPID;
var svcId = process.env.STACKTICAL_SVCID;
config = require(__base + 'config/config.js')();

var logger = require(__base + 'logger/logger.winston')(module);
var Promise = require('bluebird');
var benchmark = require(__base + 'components/benchmark/benchmark.controller');
var reports = require(__base + 'components/reports/reports.controller');

/*
* 1 [POST] /tests Initiate a new test
* 2 [GET] /tests/parameters/:serviceId Acquire application test parameters
* 3 [POST] /tests/:testId Submit each test iteration results
* 4 [POST] /reports/scalability format and submit the data for a scalability report
*/

if (apiKey && appId && svcId) {
    logger.info('Welcome to the Stacktical Capacity Testing application!');
} else {
    logger.error('The provided API credentials are not valid. Please check you APIKEY and APPID environment variables.');
    process.exit(1);
};

var testId;
/*
* # loadResults.point contains the standard Concurrency and Transaction Rate
* # LoadResults.{{name}} contains the Formated full results metrics of the load
* current load testing tool
*/
var loadResults = {'points': []};

var benchmarkPromises = [];
var workloadPromises = [];

benchmark.createTest(apiKey, appId, svcId)
    .then(function(test) {
        testId = test.testId;
        return benchmark.getTestsParameters(apiKey, appId, svcId);
    })
    .catch(function(reason) {
        logger.error(reason);
        process.exit(1);
    })
    .then(function(testParameters) {
        var application = testParameters.application;

        logger.info('The following application has been identified.', application);

        for (i=0; i<application.test_parameters.workload.length; i++) {
            var concurrency = application.test_parameters.workload[i].concurrency;
            var duration = application.test_parameters.duration;
            var delay = application.test_parameters.delay || 10

            benchmarkPromises.push(benchmark.loadTest(application.url, concurrency, duration, delay));
        }

        Promise.all(benchmarkPromises).then(function(loadTestResult) {
            for(j=0; j<loadTestResult.length; j++) {
                var Xp = parseFloat(loadTestResult[j].concurrency); // Concurrency
                var p = parseFloat(loadTestResult[j].transactionRate);  // Trans/sec
                var point =  {'p': p, 'Xp': Xp};
                logger.info('Pushing this: ', loadTestResult[j]);
                loadResults.points.push({'p': p, 'Xp': Xp});
                workloadPromises.push(benchmark.storeTestResult(apiKey, appId, testId, loadTestResult[j]));
            }
        }).catch(function(reason) {
            logger.error('One of your load tests has failed! :/', reason);
        }).then(function() {
            logger.info('The capacity test will use the following data: ', loadResults);
            reports.getScalability(apiKey, appId, loadResults)
                .then(function() {
                    logger.info(
                        'Congratulations! Your capacity test is now complete. Please go to stacktical.com to see the results.'
                    );
                })
                .catch(function(reason) {
                    logger.error(
                        'Unfortunately, I was not able to fully proceed with your capacity test. '+
                        'This mostly happens your load test results don\'t converge and there are two few, '+
                        'or not sparse enough concurrency values in your test scenario. '+
                        'Please retry with a different concurrency configuration at stacktical.com/applications.'
                    , reason.error.message || reason);
                });
        });
    })
    .finally(function() {
        return Promise.all(workloadPromises).then(function(workloadResults) {
            logger.info('Good job, your load test results have been successfully saved. :)', workloadResults);
        });
    });
