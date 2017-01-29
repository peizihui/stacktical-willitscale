var nock = require('nock');
var bench = require(__base + 'components/benchmark/benchmark.controller.js');

describe('bench', function() {
    it('getparams() should send the details of the benchmark parameters', function(done) {
        nock(config.apiUrl)
        .get('/tests/parameters')
        .reply(200, {
            name: 'stacktical',
            endpoint: 'https://stacktical.com',
            runtime: 5,
            parameters: [{concurrency: '5'}, {concurrency: '10'}],
        });
        bench.getParams('1', function(callback, parameters) {
            done();
        });
    });

    it('getTroughput() should execute the load testing', function(done) {
        this.timeout(20000);
        bench.getThroughput(null, 'http://www.clipifire.com', {
            runtime: 2,
            parameters: [{concurrency: '5'}, {concurrency: '10'}],
        });
        done();
    });

    it('submit() should send load testing result', function(done) {
        nock(config.apiUrl)
        .post('/tests/1')
        .reply(200,
            {status: 200, error: false, report: {}}
        );
        bench.loadSubmit(
            1,
            {p: 5, Xp: 27.09}
        );
        done();
    });

    it('reportSubmit() should send load testing result', function(done) {
        nock(config.apiUrl)
        .post('/reports/scalability')
        .reply(200,
            {status: 200, error: false, report: {}}
        );
        bench.reportSubmit(
            {points: [
                    {p: 5, Xp: 27.09},
                    {p: 10, Xp: 43.41},
                    {p: 15, Xp: 55},
                    {p: 20, Xp: 62.06},
                    {p: 25, Xp: 69.3},
                    {p: 30, Xp: 74.63},
                    {p: 35, Xp: 78.07},
                    {p: 40, Xp: 80.05},
            ]}
        );
        done();
    });
});
