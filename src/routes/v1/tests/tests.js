/***************
* Dependencies *
***************/

var lodash = require('lodash');

/*****************
* Implementation *
*****************/

var tests = {};

tests.getThroughput = function(req, res) {
    var concurrency = req.body.concurrency;
    var url = req.body.url;

    var result;

    var spawn = require('child_process').spawn;

    var loadTest = spawn('siege',
    [
        "-t60s",
        "-c"+concurrency,
        "-b",
        url
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
            res.status(500);
            res.json({
                'status': 500,
                'error': true,
                'code': code,
                'message': 'Unable to get throughput for specified concurrency.'
            });
            return;

        } else {
            res.status(200);
            res.json({
                'status': 200,
                'error': false,
                'code': code,
                'result': bufferResult
            });
            return;

        }

    });

};

module.exports = tests;
