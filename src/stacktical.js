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
    var point;
    var loadResults = {'points': []};
    var flaggedResults = [];
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
                var delay = service.test_parameters.delay || 30;
                var header = service.test_parameters.header;
                var authorization = service.test_parameters.authorization;
                var script_url = service.test_parameters.script_url;

                benchmarkPromises.push(
                    benchmark.loadTest(
                        service.url,
                        concurrency,
                        duration,
                        delay,
                        header,
                        authorization,
                        script_url
                    )
                );
            }

            Promise.all(benchmarkPromises).then(function(loadTestResult) {
                logger.info('New test data available: ', loadTestResult);

                if (service.test_parameters.autoclean == true) {
                    var previousIndex;
                    var nextIndex;

                    for(var j = 0; j < loadTestResult.length; j++) {
                        previousIndex = parseFloat(j)-1;
                        nextIndex = parseFloat(j)+1;

                        /**
                         * PASS 1
                         */
                        if (loadTestResult[previousIndex] != null) {
                            if (parseFloat(loadTestResult[j].concurrency) < parseFloat(loadTestResult[previousIndex].concurrency)) {
                                loadTestResult[j].flagged = true;
                                logger.info(
                                    'A load result has been flagged for auto clean (PASS 1, concurrency check).',
                                    j,
                                    loadTestResult[previousIndex].concurrency,
                                    loadTestResult[j].concurrency
                                );
                            }
                        }


                        /**
                         * PASS 2
                         */
                        if (
                             loadTestResult[previousIndex] != null &&
                             loadTestResult[nextIndex] != null
                        ) {
                            if (
                                parseFloat(loadTestResult[j].transactionRate) < parseFloat(loadTestResult[previousIndex].transactionRate) &&
                                parseFloat(loadTestResult[j].transactionRate) < parseFloat(loadTestResult[nextIndex].transactionRate)
                            ) {
                                loadTestResult[j].flagged = true;
                                logger.info(
                                    'A load result has been flagged for auto clean (PASS 2, transaction rate check).',
                                    j,
                                    loadTestResult[previousIndex].transactionRate,
                                    loadTestResult[nextIndex].transactionRate,
                                    loadTestResult[j].transactionRate
                                );
                            }
                        }
                    }
                }

                for(var j = 0; j < loadTestResult.length; j++) {
                    if (loadTestResult[j] != false) {
                        var p = parseFloat(loadTestResult[j].concurrency);
                        var Xp = parseFloat(loadTestResult[j].transactionRate);
                        var Rt = parseFloat(loadTestResult[j].responseTime);
                        var flaggedResult;

                        if (loadTestResult[j].hasOwnProperty('flagged') && loadTestResult[j].flagged == true) {
                            flaggedResult = true;
                            flaggedResults.push(loadTestResult[j]);
                        } else {
                            flaggedResult = false;
                        }

                        // Non valid values won't be added to the scalability test workload
                        if (
                            (p != null && p != 0) &&
                            (Xp != null && Xp != 0) &&
                            (Rt != null && Rt != 0) &&
                            (flaggedResult === false)
                        ) {
                            point = {
                                'p': p,
                                'Xp': Xp,
                                'Rt': Rt
                            };

                            loadResults.points.push(point);
                        }

                        workloadPromises.push(benchmark.storeTestResult(apiKey, appId, testId, loadTestResult[j]));
                    }
                }
            }).catch(function(e) {
                logger.error(
                    'Unable to proceed with load testing, please check your parameters and retry.'
                );

                throw e;
            }).then(function() {
                var createScalabilityReportPayload = loadResults;
                createScalabilityReportPayload.test_id = testId;
                createScalabilityReportPayload.stack_id = stackId;
                createScalabilityReportPayload.service_id = svcId;

                logger.info('The scalability test will use the following data: ', createScalabilityReportPayload);
                reports.createScalabilityReport(apiKey, appId, createScalabilityReportPayload)
                    .then(function(response) {
                        logger.info(
                            'Congratulations! Your scalability test is now complete. ' +
                            'Please go to https://stacktical.com/willitscale/' + response.report.serial + ' to see the results.'
                        );
                    })
                    .catch(function(reason) {
                        logger.error(
                            'Unfortunately, I was not able to proceed with your scalability test. '+
                            'This generally happens because of non suitable load testing measurements. ' +
                            'Try to update your service parameters accordingly and ensure a steady testing environment. ' +
                            'Also consider contacting support at support@stacktical.com for further assistance.'
                        );
                        process.exit(0);
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
