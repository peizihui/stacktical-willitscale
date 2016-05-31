/***************
* Dependencies *
***************/
var request = require('request');
var lodash = require('lodash');

var API_URL = 'https://stacktical.com/api/v1/'
var debug = true;

if (process.argv[2] && process.argv[3])
{
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
  baseUrl: API_URL,
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
	    if (app) {
		if (app.valid === 'true') {
			if (app.method === "ci") {
				callback(null, app);
			} else {
				console.error("This application is not configured to run in the CI plugin, please check our settings in stacktical website");
			}
		} else {
			console.error("Invalid Application, please make sure the apikey is associed to a valid application");
		}
	    } else {
		console.error("Could not parse application info");
	    }
	  }
	})
}

// Submit the load result
bench.submit = function (results, callback) {
	request.post({url: '/reports/scalability'}, function(error, response, body) {
	if (debug === true) {
		console.log(body);
	}
	if (error) {
		console.error(error);
	} else {
		console.log("Successfully sumitted load test results to stacktical. Exiting...");
		callback();
	}
	})
}

bench.getThroughput = function (err, app) {
    console.log("Start Load testing");
    var result;
    var params = app.params;

    var spawn = require('child_process').spawn;

    var loadTest = spawn('siege',
    [
        "-t" + params.time + "s",
        "-c"+ params.concurrency,
        "-b",
        app.endpoint
    ]);

    // For some reason, the transaction rate is part of stderr, not stdout
    loadTest.stderr.on('data', function(data){
        result += data;
    });

    loadTest.on('close', function(code){

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

    });

};


module.exports = bench;
