module.exports = function() {

    var debug;
    var apiEnv = process.env.STACKTICAL_API_ENV;

    switch (process.env.STACKTICAL_API_ENV)
    {
    case "dev":
        return {
            apiUrl : 'https://localhost:10003/v1',
            debug : debug
        };
    break;
    case "staging":
        return {
            apiUrl : 'https://staging.stacktical.com/api/v1'

        };
    break;
    default:
        return {
            apiUrl : 'https://stacktical.com/api/v1'

        };
    }
}
