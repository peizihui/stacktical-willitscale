config = require('./config/config.js')();
var bench = require('./components/stacktical-bench.js');

console.log(config.apiUrl);


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

	//console.log(app);
	//bench.getThroughput(app);
	var submit = {'points' : []}
	var count = 0;
	function iterateload() {
		count = count + 20;
		var app = {
			params: {
				concurrency: count,
				time: 1,
				run: 2,
				increment: 5
				},
			endpoint: 'http://clipifire.com'
		};
		var timeoutObject = setTimeout(function() {
				var ldresults = bench.getThroughput(null, app);
				//console.log(ldresults);
				submit.points.push({ 'p': parseInt(ldresults[0][1]), 'Xp': parseInt(ldresults[1][1]) });
				//console.log(submit);
				//console.log(JSON.stringify(submit));
				if (count >= 80) {
					clearTimeout(timeoutObject);
					bench.submit(JSON.stringify(submit),null);
				} else {
					iterateload(null);
				}
			}
			, 2000
		);
	}
	iterateload();
	//iterateload(null);

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

