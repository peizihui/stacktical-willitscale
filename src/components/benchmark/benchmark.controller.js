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
    function createTest(apiKey, appId) {
        var createTestOptions = {
            method: 'POST',
            uri: util.format('%s/tests', config.apiUrl),
            headers: {
                'Content-type': 'application/json',
                'x-application': appId + '',
                'Authorization': 'Bearer: ' + apiKey
            }
        };

        return baseRequestP(createTestOptions)
        .finally(function() {
            logger.info('Creating test object...');
        });
    }

    function getTestsParameters(apiKey, appId) {
        var getTestsParametersOptions = {
            uri: util.format('%s/tests/parameters', config.apiUrl),
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

    function storeTestResult(apiKey, appId, testId, loadresult) {
        var storeTestResultOptions = {
            method: 'POST',
            uri: util.format('%s/tests/' + testId, config.apiUrl),
            body: loadresult,
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

    function loadTest(url, concurrency, time) {
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


            // For some reason, the transaction rate is part of stderr, not stdout
            result = loadTest.stderr.toString();

            var bufferResult = result.split('\n');
            var validSiegeMetrics = ['Concurrency', 'Transaction rate'];
            var bufferResult = bufferResult.filter(function(std) {
                return validSiegeMetrics.some(function(metric) {
                    return std.indexOf(metric) > -1;
                });
            });

            for (var i = bufferResult.length - 1; i >= 0; i--) {
                bufferResult[i] = bufferResult[i].split(':');
                bufferResult[i][0] = lodash.trim(bufferResult[i][0]);
                bufferResult[i][1] = lodash.trim(bufferResult[i][1].split('trans/sec').join(''));
            }

            if (result) {
                var Xp = parseFloat(bufferResult[0][1]);
                var p = parseFloat(bufferResult[1][1]);
                var point = {'p': p, 'Xp': Xp};

                console.log(
                    'A new result is in: ', point
                );
                resolve(point);
            } else {
                reject({
                    err: error
                });
            };
        });
    }
})();
