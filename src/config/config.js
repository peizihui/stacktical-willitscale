module.exports = function() {
    var debug;
    var apiEnv = process.env.STACKTICAL_API_HOST;

    if (process.env.STACKTICAL_API_HOST) {
        return {
            apiUrl : apiEnv,
        };
    } else {
        return {
            apiUrl : 'https://stacktical.com/api/v1',
        };
    }
}
