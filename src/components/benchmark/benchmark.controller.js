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

    var child = require('child_process');
    
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

    function parseWrk(stdout, concurrency) {
        var lines = stdout.split('\n');
        var result = {};
        result.concurrency = concurrency;
        result.throughput = lines[lines.length - 2].split(':')[1].trim();
        result.transactionRate = Number(lines[lines.length - 3].split(':')[1].trim());

        var errorsLine = 0;
        for (var i = 0; i < lines.length; i++) {
            if (handleErrors(lines[i], result)) {
                errorsLine++;
            }
        }

        var m = lines[lines.length - 4 - errorsLine].match(/(\d+) requests in ([0-9\.]+[A-Za-z]+), ([0-9\.]+[A-Za]+)/);
        result.transactions = Number(m[1]);
        result.elapsedTime = m[2];
        result.dataTransferred = m[3];

        var latencyMinMax = lines[3].split(/[\t ]+/);
        result.responseTime = latencyMinMax[2];
        result.latencyAvg = latencyMinMax[2];
        result.latencyStdev = latencyMinMax[3];
        result.latencyMax = latencyMinMax[4];
        result.latencyStdevPerc = Number(latencyMinMax[5].slice(0, -1));
        var rpsMinMax = lines[4].split(/[\t ]+/);
        result.rpsAvg = rpsMinMax[2];
        result.rpsStdev = rpsMinMax[3];
        result.rpsMax = rpsMinMax[4];
        result.rpsStdevPerc = Number(rpsMinMax[5].slice(0, -1));

        if (lines[5].match(/Latency Distribution/)) {
            result.latency50 = lines[6].split(/[\t ]+/)[2];
            result.latency75 = lines[7].split(/[\t ]+/)[2];
            result.latency90 = lines[8].split(/[\t ]+/)[2];
            result.latency99 = lines[9].split(/[\t ]+/)[2];
        }

        var histogram = [];
        for (var i = 0; i < lines.length; ++i) {
            if (lines[i].match(/Detailed Percentile spectrum:/) && i < lines.length - 3) {
                for (var l = i + 4; lines[l] != ''; ++l) {
                    var nums = lines[l].trim().split(/[ \t]+/);
                    if (nums.length != 4) break;
                    console.log('Histo: ', nums);
                    histogram.push({
                        latency: Number(nums[0]),
                        percentile: Number(nums[1]),
                        total: Number(nums[2])
                    });
                }
                break;
            }
        }
        if (histogram.length) {
            result.histogram = histogram;
        }
        return result;
    }

    function handleErrors(line, result) {
        var errorsRe = /Socket errors: connect (\d+), read (\d+), write (\d+), timeout (\d+)/;
        var errorsMatch = line.match(errorsRe);
        if (errorsMatch) {
            result.connectErrors = errorsMatch[1];
            result.readErrors = errorsMatch[2];
            result.writeErrors = errorsMatch[3];
            result.timeoutErrors = errorsMatch[4];
            return true
        }

        var non2xx3xx = /Non-2xx or 3xx responses: (\d+)/;
        var non2xx3xxMatch = line.match(non2xx3xx);
        if (non2xx3xxMatch) {
            result.non2xx3xx = Number(non2xx3xxMatch[1]);
            return true
        }
    }

    function loadTest(url, concurrency, duration, delay) {
        concurrency = Math.trunc(concurrency);
        
        logger.info('Started load testing against ' + url + ' with a concurrency of ' + concurrency);
        
        var result;

        return new Promise(function(resolve, reject) {
            try {
                var testRun = child.spawnSync(
                    'wrk',
                    [
                        '-t1',
                        '-c' + concurrency,
                        '-d' + duration + 's',                        
                        '--latency',
                        url
                    ]
                );

                result = testRun.stdout.toString();
                var parsedResult = parseWrk(result, concurrency);
                logger.info('Your results are in! Sleeping for ' + delay + 's...', parsedResult);
                resolve(parsedResult);

                child.spawnSync('sleep', [delay]);
                logger.info('Resuming...');
            } catch(e) {
                reject(e);
            }
        });
    }
})();
