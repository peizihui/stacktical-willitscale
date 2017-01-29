var winston = require('winston');
var moment = require('moment');
var util = require('util');

require('winston-syslog').Syslog;
winston.emitErrs = true;
winston.setLevels(winston.config.syslog.levels);

module.exports = function(loggerModule) {
    var formatterVerbose = function(args) {
        var date = moment().format('DD-MMM-YYYY HH:mm:ss');
        var pid = process.pid;
        var level = args.level.toUpperCase();
        var filepath = loggerModule.filename;

        return util.format('[%s][%s][PID:%s][%s]: %s', level, date, pid, filepath, args.message);
    };

    var logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                level: 'debug',
                formatter: formatterVerbose,
                json: true,
                colorize: true
            })
        ],
        exitOnError: false
    });

    logger.stream = {
        write: function(message) {
            logger.info(message.slice(0, -1));
        }
    };

    return logger;
};
