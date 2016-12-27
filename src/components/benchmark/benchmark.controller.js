(function() {
    'use strict';

    /***************
    * Dependencies *
    ***************/

    const util = require('util');
    var Promise = require('bluebird');
    var requestP = require('request-promise');
    var logger = require(__base + 'logger/logger.winston')(module);
    var lodash = require('lodash');

    var config = require(__base +'config/config.js')();

    /*************
    * INTERFACES *
    *************/

    module.exports = {
        createTest: createTest,
        getParams: getParams,
        getThroughput: getThroughput,
        loadSubmit: loadSubmit
    };

    /*****************
    * Implementation *
    *****************/


    // TODO implements defaults
    var baseRequestP = requestP.defaults({
        json: true,
        strictSSL: false
    });
    /**
     * Create a new Test
     *
     * @param {string} x-application A unique identifier for the authenticated application.
     * @param {string} apiKey The non-expired, valid access token of the authenticated user or a valid application API key.
     * @return {Promise} Promise The returned promise object
     */
    function createTest(apiKey, appId) {
        var createTestOptions = {
            method: 'POST',
            uri: util.format('%s/v1/tests', config.apiUrl),
            headers: {
                'Content-type': 'application/json',
                'x-application': appId + '',
                'Authorization': 'Bearer: ' + apiKey
            }
        };

        logger.info(createTestOptions);
        return baseRequestP(createTestOptions)
            .finally(function() {
                logger.info('Creating test object...');
            });
    }

    function getParams(apiKey, appId) {
    var getParamsOptions = {
            uri: util.format('%s/v1/tests/parameters', config.apiUrl),
            headers: {
                'Content-type': 'application/json',
                'x-application': appId + '',
                'Authorization': 'Bearer: ' + apiKey
            }
        };

        logger.info(getParamsOptions);
        return baseRequestP(getParamsOptions)
                .finally(function() {
                    logger.info('Getting test parameters...');
                });
    };

    function loadSubmit(apiKey, appId, testId, loadresult) {
        var loadSubmitOptions = {
            method: 'POST',
            uri: util.format('%s/v1/tests/' + testId, config.apiUrl),
            body: loadresult,
            headers: {
                    'Content-type': 'application/json',
                    'x-application': appId + '',
                    'Authorization': 'Bearer: ' + apiKey
            }
        };

        logger.info(loadSubmitOptions);
        return baseRequestP(loadSubmitOptions)
                .finally(function() {
                    logger.info('Submitting load test result...');
                });
    };

    function getThroughput(endpoint, concurrency, time) {
        console.log("Start Load testing...");

        return new Promise(function(resolve, reject) {
            var result;

            var spawn = require('child_process');

            var ti = time || 60
            var loadTest = spawn.spawnSync('siege',
            [
                "-t" + ti + "s",
                "-c"+ concurrency,
                "-b",
                endpoint
            ]);

            // For some reason, the transaction rate is part of stderr, not stdout
            result = loadTest.stderr.toString()


                var bufferResult = result.split('\n');

                var validSiegeMetrics = ["Concurrency","Transaction rate"];

                var bufferResult = bufferResult.filter(function(std) {
                    return validSiegeMetrics.some(function(metric) { return std.indexOf(metric) > -1 });
                });

                for (var i = bufferResult.length - 1; i >= 0; i--) {
                  bufferResult[i] = bufferResult[i].split(':');
                  bufferResult[i][0] = lodash.trim(bufferResult[i][0]);
                  bufferResult[i][1] = lodash.trim(bufferResult[i][1].split('trans/sec').join(''));
                };

                if (!result) {
                    console.error(error);
                    reject({
                        err: error
                    });

                } else {
                    console.log("Successfully ran the siege load test");
                    console.log(bufferResult);
                    resolve(bufferResult);
                };
        });
    }


})();
