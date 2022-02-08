'use strict';
const CronJob = require('cron').CronJob;
const moment = require("moment");
const logger = require('../configs/logger');
const BigCommerce = require('node-bigcommerce');
const bigCommerce = new BigCommerce({
    logLevel: 'info',
    clientId: 'k8ynt15yrpw1k2gkqq25fqz6qc84n2m',
    secret: '60ffbdf9970e716913453a91548b1f52ba187e6f70fc9b10752a01d2b938b449',
    callback: 'https://copy-app-nextjs.herokuapp.com/api/auth',
    responseType: 'json',
    headers: { 'Accept-Encoding': '*' }, // Override headers (Overriding the default encoding of GZipped is useful in development)
    apiVersion: 'v3' // Default is v2
});

module.exports = function jobDaily () {
    const job = new CronJob('1 * * * * *', function() {
        bigCommerce.get('/products')
            .then(data => {
                console.log('data', data);
                // Catch any errors, or handle the data returned
            });
        console.log('You will see this message every second: jobDaily');
        console.log("moment().format('YYYY-MM-DD').trim()", moment().format().trim());
        logger.info(`Cron (job daily)`);
    }, null, true, 'America/Los_Angeles');
    job.start();
}