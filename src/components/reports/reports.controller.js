(function() {
    'use strict';

    /**
    * Dependencies *
    ***************/

    var util = require('util');
    var requestP = require('request-promise');
    var logger = require(__base + 'logger/logger.winston')(module);

    var config = require(__base +'config/config.js')();

    var baseRequestP = requestP.defaults({
        json: true,
        strictSSL: false
    });

    /**
    * INTERFACES *
    *************/

    module.exports = {
        getScalability: getScalability
    };

    /**
    * Implementation *
    *****************/

    /**
     * @param {string} apiKey - HTTP request object
     * @param {string} appId - HTTP response object
     * @param {object} getScalabilityPayload - HTTP response object
     * @return {object}
     */
    function getScalability(apiKey, appId, getScalabilityPayload) {
        var loadSubmitOptions = {
            method: 'POST',
            uri: util.format('%s/reports/scalability', config.apiUrl),
            body: getScalabilityPayload,
            headers: {
                'Content-type': 'application/json',
                'x-application': appId + '',
                'Authorization': 'Bearer: ' + apiKey
            }
        };

        return baseRequestP(loadSubmitOptions)
            .finally(function() {
                logger.info('Your capacity test is about to finish...');
            });
    };
})();
