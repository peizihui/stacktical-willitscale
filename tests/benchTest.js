var nock = require('nock');
var Bench = require('../src/bench');
var API_URL = 'https://stacktical.com/api/v1/'

it('', function(done) {
	nock(API_URL)
		.get('/tests/parameters')
		.reply(200, {
			name: 'stacktical',
			endpoint: 'https://www.stacktical.com',
			valid: 'true',
			params: {
				concurrency: '10',
				time: '60',
				run: '1',
				increment: '5'
			}
		});
	Bench.getparams('1', function(params) {
		// Some checks
		done();
	});

});
