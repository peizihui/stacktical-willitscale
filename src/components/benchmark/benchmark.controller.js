(function() {
    'use strict';

    /**
    * Dependencies *
    ***************/

    var util = require('util');
    var Promise = require('bluebird');
    var requestP = require('request-promise');
    var logger = require(__base + 'logger/logger.winston')(module);
    var lodash = require('lodash');
    var camelCase = require('camelcase');

    var config = require(__base +'config/config.js')();

    /**
    * INTERFACES *
    *************/

    module.exports = {
        createTest: createTest,
        getTestsParameters: getTestsParameters,
        loadTest: loadTest,
        storeTestResult: storeTestResult
    };

    /**
    * Implementation *
    *****************/

    var baseRequestP = requestP.defaults({
        json: true,
        strictSSL: false
    });

    /**
    * Creates a new Test.
    *
    * @param {string} apiKey The non-expired, valid access token of the authenticated user or a valid application API key.
    * @param {string} appId Unique identifier for the authenticated application.
    * @return {Promise} Promise The returned promise object
    */
    function createTest(apiKey, appId, serviceId) {
        var createTestOptions = {
            method: 'POST',
            uri: util.format('%s/tests', config.apiUrl),
            body: {
                service_id: serviceId
            },
            headers: {
                'Content-type': 'application/json',
                'x-application': appId + '',
                'service-id': serviceId,
                'Authorization': 'Bearer: ' + apiKey
            }
        };

        return baseRequestP(createTestOptions);
    }

    function getTestsParameters(apiKey, appId, serviceId) {
        var getTestsParametersOptions = {
            uri: util.format('%s/tests/parameters/' + serviceId, config.apiUrl),
            headers: {
                'Content-type': 'application/json',
                'x-application': appId + '',
                'Authorization': 'Bearer: ' + apiKey
            }
        };

        return baseRequestP(getTestsParametersOptions)
        .finally(function() {
            logger.info('Getting test parameters...');
        });
    };

    function storeTestResult(apiKey, appId, testId, loadTestResult) {
        var storeTestResultOptions = {
            method: 'POST',
            uri: util.format('%s/tests/' + testId, config.apiUrl),
            body: {
                result: loadTestResult
            },
            headers: {
                'Content-type': 'application/json',
                'x-application': appId + '',
                'Authorization': 'Bearer: ' + apiKey
            }
        };

        return baseRequestP(storeTestResultOptions)
        .finally(function() {
            logger.info('Submitting single load test result...');
        });
    };

    function loadTest(url, concurrency, time, delay) {
        logger.info('Started load testing against ' + url + ' with a concurrency of ' + concurrency);

        return new Promise(function(resolve, reject) {
            var result;

            var spawn = require('child_process');

            var loadTest = spawn.spawnSync(
                'siege',
                [
                    '-t' + time + 's',
                    '-c' + concurrency,
                    '-b',
                    url
                ]
            );

            logger.info('Done! Sleeping for ' + delay + 's...');
            spawn.spawnSync('sleep', [delay]);
            logger.info('Resuming...');

            // For some reason, the transaction rate is part of stderr, not stdout
            result = loadTest.stderr.toString();

            var bufferResult = result.split('\n');
            var validSiegeMetrics = [
                'Concurrency',
                'Transaction rate',
                'Transactions',
                'Availability',
                'Elapsed time',
                'Data transferred',
                'Response time',
                'Throughput',
                'Successful transactions',
                'Failed transactions',
                'Longest transaction',
                'Shortest transaction'
            ];
            var bufferResult = bufferResult.filter(function(std) {
                return validSiegeMetrics.some(function(metric) {
                    return std.indexOf(metric) > -1;
                });
            });

            for (var i = bufferResult.length - 1; i >= 0; i--) {
                bufferResult[i] = bufferResult[i].split(':');
                bufferResult[i][0] = camelCase(lodash.trim(bufferResult[i][0]));
                bufferResult[i][1] = parseFloat(
                    lodash.trim(
                        bufferResult[i][1].split(/%|secs|hits|trans\/sec|MB\/sec|MB/g)
                            .join('')
                    )
                );
            }

            /**
             * @param {object} array
             * @return {array}
             */
            function objectify(array) {
                return array.reduce(function(p, c) {
                    p[c[0]] = c[1];
                    return p;
                }, {});
            }

            if (bufferResult) {
                if (objectify(bufferResult)) {
                    logger.info(objectify(bufferResult));
                    resolve(objectify(bufferResult));
                } else {
                    resolve(false);
                }
            } else {
                reject({
                    err: error
                });
            };
        });
    }
})();
