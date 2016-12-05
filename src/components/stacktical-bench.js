/***************
* Dependencies *
***************/
var request = require('request');
var lodash = require('lodash');

config = require(__base +'config/config.js')();
var debug = true;

// Set apiKey and appId paramaters
if (process.argv[2] && process.argv[3]) {
	var apiKey = new Buffer(process.argv[2]);
	var appId = new Buffer(process.argv[3]);
	console.log("Starting Stacktical bench image with api key: " + apiKey + " applicationID: " + appId);
	} else {
	console.error("Could not read api key and application ID as, please provide api key as parameter of the script");
}

// Set request defaults. All request contains the apiKey
// TODO disable strictSSL only in debugmode
var request = request.defaults({
  baseUrl: config.apiUrl,
  strictSSL: false,
  headers: {
	'Authorization': apiKey,
	'content-type': 'application/json'
  }
})

var params = [];
var bench = {};
var app = {};
var test = {};

// Create a new test
bench.createTest = function(apiKey, callback) {
  request.post({url: 'tests', headers: {'x-application': appId}, json: true}, function(error, response, body) {
    if (debug === true) {
      console.log(JSON.stringify(body));
    }
    if (error) {
      console.error(error);
    } else {
      test.id = JSON.parse(body).testId;
      console.log("Created new test...");
      callback(null, iterateload)
    }
  })
}

// Fetch load test parameters from stacktical
bench.getParams = function(apiKey, callback) {
	request.get({url: '/tests/parameters'}, function(error, response, body) {
	  if (debug === true) {
	    console.log(body);
	  }
	  if (error) {
	    console.error(error);
	  } else {
	    // Parse the load test parameters
	    params = JSON.parse(body);
	    console.log("Received parameters for app: " + app.name);
	    callback(null, app, params);
	  }
	})
}

// Submit a single load test result
// TODO Adjust according th the API specs
bench.loadSubmit = function(test, loadResult) {
	request.post({url: '/tests/' + test.id, body: loadResult, json: true}, function(error, response, body) {
	if (debug === true) {
		console.log(JSON.stringify(body));
	}
	if (error) {
		console.error(error);
	} else {
		console.log("Successfully submitted the test result unit to stacktical.");
	}
	})
}


// Submit the load result
// USE report stalability by using  token to verify
bench.reportSubmit = function (loadResults) {
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

bench.getThroughput = function (err, endpoint, concurrency, time) {
    console.log("Start Load testing...");
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
