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
        reportSubmit: reportSubmit
    };

    /*****************
    * Implementation *
    *****************/

    /**
     * fooBar
     * @param {object} req - HTTP request object
     * @param {object} res - HTTP response object
     */
    function reportSubmit(appId, apiKey, loadResults) {
        var reportsubmitOptions = {
            method: 'POST',
                uri: util.format('%s/v1/reports/scalability', 'https://stacktical.com/api'),
            body: loadResults,
            json: true
        };
	}

    }
})();
