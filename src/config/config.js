module.exports = function() {

    var debug;
    var apiEnv = process.env.STACKTICAL_API_HOST;

    if (process.env.STACKTICAL_API_HOST) {
        return {
            apiUrl : apiEnv,
            debug : debug
        };
    } else {
        return {
            apiUrl : 'https://stacktical.com/api/v1',
            debug : false
        };
    }
}
