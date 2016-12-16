/***************
* Dependencies *
***************/

var Promise = require("bluebird");
var request = Promise.promisify(require('request'));
var lodash = require('lodash');

var config = require(__base +'config/config.js')();

// Set apiKey and appId paramaters
if (process.argv[2] && process.argv[3]) {
	var apiKey = new Buffer(process.argv[2]);
	var appId = new Buffer(process.argv[3]);
	console.log("Starting Stacktical bench image with api key: " + apiKey + " applicationID: " + appId);
	} else {
	console.error("Could not read api key and application ID as, please provide api key as parameter of the script");
}

var params = {};
var bench = {};
var app = {};
var test = {};
var loadResults = {'points' : []};

// Create a new test
bench.createTest = function(apiKey) {
    return new Promise(function(resolve, reject) {
        console.log('Initiating new Test')
        request.post({url: 'tests', json: true}, function(error, response, body) {
            if (config.debug === true) {
                console.log(JSON.stringify(body));
            }
            if (error) {
                console.error(error);
                reject({
                    err: error
                });
            } else {
                test.id = JSON.stringify(body).testId;
                console.log("Created new test...");
                resolve(test);
                //callback(null, callback)
            }
        })
    })
}

// Fetch load test parameters from stacktical
bench.getParams = function(apiKey, callback) {

    return new Promise(function(resolve, reject) {
        console.log('Initiating getParams')
        request.get({url: '/tests/parameters'}, function(error, response, body) {
            if (config.debug === true) {
              console.log(body);
            };

            if (error) {
              console.error(error);
              reject({
                  err: error
              });
            } else {
              // Parse the load test parameters
              //params = JSON.stringify(body);
              params = body;
              console.log("Received parameters for app: " + app.appId);
              resolve(params);
            };
        });
    });
}

// Submit a single load test result
// TODO Adjust according th the API specs
bench.loadSubmit = function(test, loadResult) {

    return new Promise(function(resolve, reject) {
        request.post({url: '/tests/' + test.id, body: loadResult, json: true}, function(error, response, body) {
        if (config.debug === true) {
            console.log(JSON.stringify(body));
        };
        if (error) {
            console.error(error);
            reject({
                err: error
            });
        } else {
            console.log("Successfully submitted the test result unit to stacktical.");
        };
        });
    });
}


// Submit the load result
// USE report stalability by using  token to verify
bench.reportSubmit = function (loadResults) {

    return new Promise(function(resolve, reject) {
        request.post({url: '/reports/scalability', body: loadResults, json: true}, function(error, response, body) {
            if (config.debug === true) {
                console.log(JSON.stringify(body));
            };
            if (error) {
                console.error(error);
                reject({
                    err: error
                });
            } else {
                console.log("Successfully sumitted load test results to stacktical. Exiting...");
            };
        });
    });
}

bench.getThroughput = function (endpoint, concurrency, time) {
    console.log("Start Load testing...");

    return new Promise(function(resolve, reject) {
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
            };

            if (!result) {
                console.error(error);
                reject({
                    err: error
                });

            } else {
                console.log("Successfully ran the siege load test");
                console.log(bufferResult);
                resolve(bufferResult);
            };
    });
}

bench.iterateload = function(app, params) {
    // TODO get the api to return the full application object
    console.log("Starting load testing loop");
    var params = {"parameters":[{"concurrency":20},{"concurrency":15}]};
    console.log(params);
    return new Promise(function(resolve, reject) {
        var timeoutObject = setTimeout(function() {
            for (var i in params.parameters) {
                console.log(params.parameters[i]);
                var concurrency = params.parameters[i].concurrency;
                console.log(concurrency);
                console.log(params.parameters[i]);
                bench.getThroughput('https://localhost:10006', concurrency, 15)
                    .then(function(ldresults) {
                        console.log("getThroughput");
                        var p = parseInt(ldresults[0][1]);
                        var Xp = parseInt(ldresults[1][1]);
                        loadResults.points.push({ 'p': p, 'Xp': Xp });
                        submit = {"points":[{"p":5,"Xp":27.09},{"p":10,"Xp":43.41},{"p":15,"Xp":55},{"p":20,"Xp":62.06},{"p":25,"Xp":69.3},{"p":30,"Xp":74.63},{"p":35,"Xp":78.07},{"p":40,"Xp":80.05}]};
                        bench.loadSubmit(p, Xp);
                        for (var loadTest in app) {
                            iterateload(null,loadTest);
                        }
                        console.log(submit);
                        //bench.reportSubmit(submit).catch(function(reason) {
                        //    console.log('Unable to submit this load test results :' + reason);
                        //});
                    });
            }
            clearTimeout(timeoutObject);
        },2000);
    resolve();
    });
};

module.exports = bench;
