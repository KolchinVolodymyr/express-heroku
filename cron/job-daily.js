'use strict';
const CronJob = require('cron').CronJob;
const moment = require("moment");
const logger = require('../configs/logger');

module.exports = function jobDaily () {
    const job = new CronJob('* * * * * *', function() {
        console.log('You will see this message every second: jobDaily');
        console.log("moment().format('YYYY-MM-DD').trim()", moment().format().trim());
        logger.info(`Cron (job daily)`);
    }, null, true, 'America/Los_Angeles');
    job.start();
}