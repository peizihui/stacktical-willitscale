(function() {
    'use strict';

    /***************
    * Dependencies *
    ***************/

    var Promise = require('bluebird');
    var requestP = require('request-promise');
    var logger = require(__base + 'logger/logger.winston')(module);

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
    function createTest(appId, apiKey) {
        var createTestOptions = {
            uri: util.format('%s/v1/tests', 'https://stacktical.com/api'),
            headers: {
                x-application: appId,
                Authorization: 'Bearer ' + apiKey
            },
            json: true
        };

        return requestP(createTestOptions)
            .finally(function() {
                logger.info('Creating test object...');
            });
    }

    function getParams(appId, apiKey) {
    var getParamsOptions = {
            uri: util.format('%s/v1/tests/parameters', 'https://stacktical.com/api'),
            headers: {
                x-application: appId,
                Authorization: 'Bearer ' + apiKey
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
            uri: util.format('%s/v1/tests/' + testId, 'https://stacktical.com/api'),
        body: loadresult,
        json: true
    };

        return requestP(loadSubmitOptions)
                .finally(function() {
                    logger.info('Submitting load test result...');
                });

    }


})();
