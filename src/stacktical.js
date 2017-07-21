(function() {
    'use strict';

    global.__base = __dirname + '/';
    require(__base + 'config/config.js')();
    var logger = require(__base + 'logger/logger.winston')(module);
    var Promise = require('bluebird');
    var benchmark = require(__base + 'components/benchmark/benchmark.controller');
    var reports = require(__base + 'components/reports/reports.controller');

    var apiKey = process.env.STACKTICAL_APIKEY;
    var appId = process.env.STACKTICAL_APPID;
    var svcId = process.env.STACKTICAL_SVCID;

    if (apiKey && appId && svcId) {
        logger.info('Welcome to the Stacktical Scalability Testing application.');
    } else {
        logger.error(
            'We are not able to authenticate you with the provided credentials. ' +
            'Have you properly set your STACKTICAL_SVCID, STACKTICAL_APPID and STACKTICAL_APIKEY environment variables?'
        );
        process.exit(1);
    };

    var testId;
    var stackId;
    var loadResults = {'points': []};
    var benchmarkPromises = [];
    var workloadPromises = [];

    benchmark.createTest(apiKey, appId, svcId)
        .then(function(test) {
            testId = test.test_id;
            return benchmark.getTestsParameters(apiKey, appId, svcId);
        })
        .catch(function(reason) {
            logger.error(
                'Unable to continue, there has been an error.'
            );
            process.exit(1);
        })
        .then(function(testParameters) {
            var service = testParameters.service;
            stackId = testParameters.service.stack_id;

            logger.info('The following service has been identified.', service);

            for (var i = 0; i < service.test_parameters.workload.length; i++) {
                var concurrency = service.test_parameters.workload[i].concurrency;
                var duration = service.test_parameters.duration;
                var delay = service.test_parameters.delay || 10;

                benchmarkPromises.push(
                    benchmark.loadTest(
                        service.url,
                        concurrency,
                        duration,
                        delay
                    )
                );
            }

            Promise.all(benchmarkPromises).then(function(loadTestResult) {
                for(var j = 0; j < loadTestResult.length; j++) {
                    var p = parseFloat(loadTestResult[j].concurrency);
                    var Xp = parseFloat(loadTestResult[j].transactionRate);
                    var Rt = parseFloat(loadTestResult[j].responseTime);

                    if (
                        (p != null && p != 0) &&
                        (Xp != null && Xp != 0) &&
                        (Rt != null && Rt != 0)
                    ) {
                        loadResults.points.push({'p': p, 'Xp': Xp, 'Rt': Rt});
                        workloadPromises.push(benchmark.storeTestResult(apiKey, appId, testId, loadTestResult[j]));
                    }
                }
            }).catch(function(reason) {
                logger.error(
                    'One of your load tests has failed! :/'
                );
            }).then(function() {
                var createScalabilityReportPayload = loadResults;
                createScalabilityReportPayload.test_id = testId;
                createScalabilityReportPayload.stack_id = stackId;
                createScalabilityReportPayload.service_id = svcId;

                logger.info('The scalability test will use the following data: ', createScalabilityReportPayload);
                reports.createScalabilityReport(apiKey, appId, createScalabilityReportPayload)
                    .then(function() {
                        logger.info(
                            'Congratulations! Your scalability test is now complete. ' +
                            'Please go to stacktical.com to see the results.'
                        );
                    })
                    .catch(function(reason) {
                        logger.error(
                            'Unfortunately, I was not able to fully proceed with your scalability test. '+
                            'This mostly happens with bad load test measures or bad testing parameters. '+
                            'Please retry or consider contacting support at support@stacktical.com for assistance.'
                        );
                        process.exit(1);
                    });
            });
        })
        .catch(function(reason) {
            logger.error(
                'Unable to continue, there has been an error.'
            );
            process.exit(1);
        })
        .then(function() {
            return Promise.all(workloadPromises).then(function(workloadResults) {
                logger.info('Your load test results have been archived for future reference.', workloadResults);
            });
        });
})();
