var os = require('os');
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

    var formatterVerboseNoDate = function(args) {
        var pid = process.pid;
        var level = args.level.toUpperCase();
        var filepath = loggerModule.filename;

        return util.format('[%s][PID:%s][%s]: %s', level, pid, filepath, args.message);
    };

    var logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                level: 'debug',
                formatter: formatterVerbose,
                json: true,
                colorize: true
            }),
            new winston.transports.Syslog({
                level: 'debug',
                protocol: 'unix',
                path: (os.platform() === 'darwin' ? '/var/run/syslog' : '/dev/log'),
                facility: 'local0',
                formatter: formatterVerboseNoDate
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
