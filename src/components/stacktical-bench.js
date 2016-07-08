/***************
* Dependencies *
***************/
var request = require('request');
var lodash = require('lodash');

config = require(__base +'config/config.js')();
var debug = true;

if (process.argv[2] && process.argv[3]) {
	var apiKey = new Buffer(process.argv[2] + ":" + process.argv[3]).toString('base64');
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
  headers: [
  {
    name :'Content-Type',
    value: 'application/json',
    apikey: apiKey
  }]
})


var app,
    params;

// Fetch load test parameters from stacktical
var bench = {};
bench.getparams = function(apiKey, callback) {
/*	request.get({url: '/tests/parameters'}, function(error, response, body) {
	  if (debug === true) {
	    // For debugging
	    console.log(body);
	  }
	  if (error) {
	    console.error(error);
	  } else {
	    // Parse the load test parameters
	    app = JSON.parse(body);
	    //return app;
	  }
	})
	  */
	var app = {
			params: {
				concurrency: 0,
				time: 10,
				run: 2,
				increment: 5
				},
			endpoint: 'http://clipifire.com'
		};
	callback(null, app);
}

// Submit the load result
// USE report stalability by using  token to verify
bench.submit = function (results) {
	console.log("In bench.submit" + results);
	request.post({url: '/s/reports/scalability'}, function(error, response, body) {
	if (debug === true) {
		console.log(body);
	}
	if (error) {
		console.error(error);
	} else {
		console.log("Successfully sumitted load test results to stacktical. Exiting...");
	}
	})
}

bench.getThroughput = function (err, app) {
    console.log("Start Load testing");
    console.log(app);
    var result;
    var params = app.params;

    var spawn = require('child_process');

    var loadTest = spawn.spawnSync('siege',
    [
        "-t" + params.time + "s",
        "-c"+ params.concurrency,
        "-b",
        app.endpoint
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
