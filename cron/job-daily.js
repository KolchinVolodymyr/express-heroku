'use strict';
const CronJob = require('cron').CronJob;

module.exports = function jobDaily () {
    console.log('module.exports module.exports');
    const job = new CronJob('* * * * * *', function() {
        console.log('You will see this message every second: jobDaily');
    }, null, true, 'America/Los_Angeles');
    job.start();
}