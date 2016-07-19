global.__base = __dirname + '/';
config = require(__base + 'config/config.js')();
var bench = require(__base + 'components/stacktical-bench.js');

/// Write the LOOp and test the reporting first
/*
 * 1 acquire params
 * 2 loop into load testings
 * 3 format and submit the data
 */

var loadResults = {'points' : []};
function iterateload(err, app) {
	app.params.concurrency = app.params.concurrency + 20;
	var timeoutObject = setTimeout(function() {
			var ldresults = bench.getThroughput(null, app);
			loadResults.points.push({ 'p': parseInt(ldresults[0][1]), 'Xp': parseInt(ldresults[1][1]) });
			/* if (app.params.concurrency >= 20) {
				clearTimeout(timeoutObject);
				submit = {"points":[{"p":5,"Xp":27.09},{"p":10,"Xp":43.41},{"p":15,"Xp":55},{"p":20,"Xp":62.06},{"p":25,"Xp":69.3},{"p":30,"Xp":74.63},{"p":35,"Xp":78.07},{"p":40,"Xp":80.05}]};
				bench.submit(submit);
			} else {
				iterateload(null,app);
			}*/
			for (var loadTest in app) {
				iterateload(null,loadTest);
			}
			clearTimeout(timeoutObject);
			bench.submit(submit);
		}
		, 2000
	);
}

bench.getparams(null,iterateload);
