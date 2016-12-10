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
        createTest: createTest
    };

    /*****************
    * Implementation *
    *****************/

    /**
     * Retrieve streamer information
     *
     * @param {string} streamerId The id of the streamer we're getting information about
     * @param {string} genyId The uuid of the authenticated user
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
})();
