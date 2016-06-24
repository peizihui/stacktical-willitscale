var bench = require('./components/stacktical-bench.js');
config = require('./config/config.js')();

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

for(var count=5;count<=15;count = count+5) {
	var app = {
	params: {
		concurrency: count,
		time: 10,
		run: 2,
		increment: 5
		},
	endpoint: 'http://clipifire.com'
	};
	console.log(app);
	//bench.getThroughput(app);
	setTimeout(function() {
		bench.getThroughput(null, app);
	}, app.params.time+2000);
	
}

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

