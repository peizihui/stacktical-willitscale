/***************
* Dependencies *
***************/
var request = require('request');
var lodash = require('lodash');

config = require(__base +'config/config.js')();
var debug = true;

// we pass a single API key without expiration
if (process.argv[2]) {
	var apiKey = new Buffer(process.argv[2]);
	console.log("Starting Stacktical bench image with api key: " + apiKey);
	} else {
	console.error("Could not read api key parameter, please provide api key as parameter of the script");
}

/***************
*Fetch load testing parameters
*GET /tests/{apiKey}/parameters
*
*Run the test load
*POST /tests/loop
*
*Submit the load results
*POST /reports/scalability
****************/

// Set request defaults
var request = request.defaults({
  baseUrl: config.apiUrl,
  strictSSL: false,
  headers: {
	'X-Access-Token': apiKey,
	'content-type': 'application/json'
  }
})

var app, params;

// Fetch load test parameters from stacktical
var bench = {};
bench.getparams = function(apiKey, callback) {
	
	request.get({url: '/tests/parameters'}, function(error, response, body) {
	  if (debug === true) {
	    // For debugging
	    console.log(body);
	  }
	  if (error) {
	    console.error(error);
	  } else {
	    // Parse the load test parameters
	    app = JSON.parse(body);
	    console.log("Received parameters for app: " + app.name);
	    callback(null, app.parameters);
	  }
	})
}

// Submit the load result
// USE report stalability by using  token to verify
bench.submit = function (loadResults) {
	request.post({url: '/reports/scalability', body: loadResults, json: true}, function(error, response, body) {
	if (debug === true) {
		console.log(JSON.stringify(body));
	}
	if (error) {
		console.error(error);
	} else {
		console.log("Successfully sumitted load test results to stacktical. Exiting...");
	}
	})
}

bench.getThroughput = function (err, endpoint, app) {
    console.log("Start Load testing...");
    console.log(app);
    var result;
    var params = app.parameters;

    var spawn = require('child_process');

    var ti = app.runtime || 60
    var loadTest = spawn.spawnSync('siege',
    [
        "-t" + ti + "s",
        "-c"+ params.concurrency,
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
        }

        if (!result) {
            console.error(error);
            return false;

        } else {
            console.log("Successfully ran the siege load test");
            console.log(bufferResult);
            return bufferResult;
        }
};

module.exports = bench;
