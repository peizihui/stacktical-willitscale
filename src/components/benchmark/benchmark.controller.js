(function() {
    'use strict';

    /***************
    * Dependencies *
    ***************/

    const util = require('util');
    var Promise = require('bluebird');
    var requestP = require('request-promise');
    var logger = require(__base + 'logger/logger.winston')(module);

    var config = require(__base +'config/config.js')();

    /*************
    * INTERFACES *
    *************/

    module.exports = {
        createTest: createTest,
        getParams: getParams
    };

    /*****************
    * Implementation *
    *****************/

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
            uri: util.format('%s/v1/tests', 'https://localhost:10003'),
            //uri: util.format('%s/v1/tests', config.apiUrl),
            headers: {
                'x-application': appId + '',
                'Authorization': 'Bearer: ' + apiKey
            },
            json: true
        };

        logger.info(createTestOptions);
        return requestP(createTestOptions)
            .finally(function() {
                logger.info('Creating test object...');
            });
    }

    function getParams(apiKey, appId) {
    var getParamsOptions = {
            uri: util.format('%s/v1/tests/parameters', config.apiUrl),
            headers: {
                'x-application': appId,
                'Authorization': 'Bearer :' + apiKey
            },
            json: true
        };

        return requestP(getParamsOptions)
                .finally(function() {
                    logger.info('Getting test parameters...');
                });
    }

    function loadSubmit(appId, apiKey, testId, loadesult) {
    var loadSubmitOptions = {
        method: 'POST',
            uri: util.format('%s/v1/tests/' + testId, config.apiUrl),
        body: loadresult,
        headers: {
                'x-application': appId,
                'Authorization': 'Bearer :' + apiKey
        },
        json: true
    };

        return requestP(loadSubmitOptions)
                .finally(function() {
                    logger.info('Submitting load test result...');
                });

    }


})();
