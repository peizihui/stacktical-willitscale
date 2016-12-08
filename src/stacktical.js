global.__base = __dirname + '/';
config = require(__base + 'config/config.js')();
var bench = require(__base + 'components/stacktical-bench.js');

/*
 * 1 [POST] /tests Initiate a new test
 * 2 [GET] /tests/parameters Acquire application test parameters
 * 3 [POST] /tests/:testId Submit each test iteration results
 * 4 [POST] /reports/scalability format and submit the data for a scalability report
 */

var loadResults = {'points' : []};
function iterateload(err, app, params) {
	console.log(params);
	// TODO loop through params
	for (var i = 0, len = param.length; i < len; i++) {
		var concurrency = app.params[i].concurrency + 20;
		var timeoutObject = setTimeout(function() {
				var ldresults = bench.getThroughput(null, app);
				var p = parseInt(ldresults[0][1]);
				var Xp = parseInt(ldresults[1][1]);
				loadResults.points.push({ 'p': p, 'Xp': Xp });
				/* if (app.params.concurrency >= 20) {
					clearTimeout(timeoutObject);
					submit = {"points":[{"p":5,"Xp":27.09},{"p":10,"Xp":43.41},{"p":15,"Xp":55},{"p":20,"Xp":62.06},{"p":25,"Xp":69.3},{"p":30,"Xp":74.63},{"p":35,"Xp":78.07},{"p":40,"Xp":80.05}]};
					bench.submit(submit);
				} else {
					iterateload(null,app);
				}*/
			// TODO Submit the single load test result
				// This operation is not critical
				bench.loadSubmit(p, Xp);
				for (var loadTest in app) {
					iterateload(null,loadTest);
				}
				clearTimeout(timeoutObject);
				bench.reportSubmit(submit);
			}
			, 2000
		);
        };
}

// Start
bench.createTest(null, bench.getParams);
