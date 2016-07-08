global.__base = __dirname + '/';
config = require(__base + 'config/config.js')();
var bench = require(__base + 'components/stacktical-bench.js');

//bench.getparams(1, function(whut) {
//			console.log(whut);
//			}
//		);


/// Write the LOOp and test the reporting first
/*
 * 1 acquire params
 * 2 loop into load testings
 * 3 format and submit the data
 */
/*
		var app = {
			params: {
				concurrency: count,
				time: 10,
				run: 2,
				increment: 5
				},
			endpoint: 'http://clipifire.com'
		};
*/
var submit = {'points' : []}
function iterateload(err, app) {
	app.params.concurrency = app.params.concurrency + 20;
	var timeoutObject = setTimeout(function() {
			var ldresults = bench.getThroughput(null, app);
			submit.points.push({ 'p': parseInt(ldresults[0][1]), 'Xp': parseInt(ldresults[1][1]) });
			if (app.params.concurrency >= 80) {
				clearTimeout(timeoutObject);
				bench.submit(JSON.stringify(submit));
			} else {
				iterateload(null,app);
			}
		}
		, 2000
	);
}

bench.getparams(null,iterateload)
//iterateload();

//if (app) {
//		if (app.valid === 'true') {
//			if (app.method === "ci") {
//				//callback(null, app);
//				return app;
//			} else {
//				console.error("This application is not configured to run in the CI plugin, please check our settings in stacktical website");
//			}
//		} else {
//			console.error("Invalid Application, please make sure the apikey is associed to a valid application");
//		}
//	    } else {
//		console.error("Could not parse application info");
//}
