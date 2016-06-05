var fs      = require('fs');
var nock = require('nock');
var bench = require('../src/stacktical.js');
//var API_URL = 'https://stacktical.com/api/v1/'
config = JSON.parse(fs.readFileSync('./src/config'));

describe('bench', function() {
	it('getparams() should send the details of the benchmark parameters', function (done) {
		nock(config.api_url)
			.get('/tests/parameters')
			.reply(200, {
				name: 'stacktical',
				endpoint: 'https://stacktical.com',
				valid: 'true',
				method: 'ci',
				params: {
					concurrency: '10',
					time: '6',
					run: '2',
					increment: '5'
				}
			});
		bench.getparams('1', function(benchDetails) {
			// Some checks
			done();
		});
	});

	it('getTroughput() should execute the load testing', function (done) {
		this.timeout(20000);
		var results = bench.getThroughput(null,
					{
						endpoint: 'https://stacktical.com',
						params: {
							concurrency: '5',
							time: '6'
						}
					});
		// TODO need to be synchrone here to allow the load test
		// results
		// Currently returns undefined
		setTimeout(function(results) {
			console.log(results);
			done()
		}, 6500);
	});

	it('submit() should send load testing result', function (done) {
		nock(config.api_url)
			.post('/reports/scalability')
			.reply(200,
				{"status":200,"error":false,"report":{}}
			);
		bench.submit(
			{"points":[{"p":5,"Xp":27.09},{"p":10,"Xp":43.41},{"p":15,"Xp":55},{"p":20,"Xp":62.06},{"p":25,"Xp":69.3},{"p":30,"Xp":74.63},{"p":35,"Xp":78.07},{"p":40,"Xp":80.05}]},
			function(submitDetails) {
				//some checks
				done();
			}
		);
	});

});
