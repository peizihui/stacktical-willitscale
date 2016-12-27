module.exports = function() {

    var debug = true;
    if (debug === true) {
        return {
            apiUrl : 'https://localhost:10003',
            debug : debug
        };
    } else {
        return {
            apiUrl : 'https://stacktical.com/api/v1/'
        };
    }
}
