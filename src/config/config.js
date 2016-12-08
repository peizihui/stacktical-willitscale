module.exports = function() {

    var debug = true;
    if (debug === true) {
        return {
            apiUrl : 'https://0.0.0.0:10003/v1/',
            debug : debug
        };
    } else {
        return {
            apiUrl : 'https://stacktical.com/api/v1/'
        };
    }
}
