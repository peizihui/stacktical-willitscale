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
* 2 [GET] /tests/parameters/:serviceId Acquire service test parameters
* 3 [POST] /tests/:testId Submit each test iteration results
* 4 [POST] /reports/scalability format and submit the data for a scalability report
*/

if (apiKey && appId && svcId) {
    logger.info('Welcome to the Stacktical Capacity Testing service!');
} else {
    logger.error(
        'We are not able to authenticate you with the provided credentials. ' +
        'Have you properly set your STACKTICAL_SVCID, STACKTICAL_APPID and STACKTICAL_APIKEY environment variables?'
    );
    process.exit(1);
};

var testId;
var stackId;
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
        testId = test.test_id;
        return benchmark.getTestsParameters(apiKey, appId, svcId);
    })
    .catch(function(reason) {
        logger.error(reason);
        process.exit(1);
    })
    .then(function(testParameters) {
        var service = testParameters.service;
        stackId = testParameters.service.stack_id;

        logger.info('The following service has been identified.', service);

        for (i=0; i<service.test_parameters.workload.length; i++) {
            var concurrency = service.test_parameters.workload[i].concurrency;
            var duration = service.test_parameters.duration;
            var delay = service.test_parameters.delay || 10;

            benchmarkPromises.push(benchmark.loadTest(service.url, concurrency, duration, delay));
        }

        Promise.all(benchmarkPromises).then(function(loadTestResult) {
            for(j=0; j<loadTestResult.length; j++) {
                var p = parseFloat(loadTestResult[j].concurrency);
                var Xp = parseFloat(loadTestResult[j].transactionRate);
                var Rt = parseFloat(loadTestResult[j].responseTime);
                loadResults.points.push({'p': p, 'Xp': Xp, 'Rt': Rt});
                workloadPromises.push(benchmark.storeTestResult(apiKey, appId, testId, loadTestResult[j]));
            }
        }).catch(function(reason) {
            logger.error('One of your load tests has failed! :/', reason);
        }).then(function() {
            var getScalabilityPayload = loadResults;
            getScalabilityPayload.test_id = testId;
            getScalabilityPayload.stack_id = stackId;

            logger.info('The capacity test will use the following data: ', getScalabilityPayload);
            reports.getScalability(apiKey, appId, getScalabilityPayload)
                .then(function() {
                    logger.info(
                        'Congratulations! Your capacity test is now complete. Please go to stacktical.com to see the results.'
                    );
                })
                .catch(function(reason) {
                    logger.error(
                        'Unfortunately, I was not able to fully proceed with your capacity test. '+
                        'This mostly happens your load test results don\'t converge and there are two few, '+
                        'or not sparse enough concurrency values in your test scenario. '
                    , reason.error.message || reason);
                });
        });
    })
    .finally(function() {
        return Promise.all(workloadPromises).then(function(workloadResults) {
            logger.info('Good job, your load test results have been successfully saved. :)', workloadResults);
        });
    });
