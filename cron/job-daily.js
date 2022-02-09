'use strict';
const CronJob = require('cron').CronJob;
const moment = require("moment");
const logger = require('../configs/logger');
const BigCommerce = require('node-bigcommerce');
const csvWriter = require("csv-write-stream");
const fs = require("fs");
const User = require("../schema");
const transporter = require("../lib/nodemailer");
const bigCommerce = new BigCommerce({
    clientId: 'k8ynt15yrpw1k2gkqq25fqz6qc84n2m',
    accessToken: 't9gujcm30mth0sx7m8w8u9nwn7s4h6m',
    storeHash: '85kzbf18qd',
    responseType: 'json',
    apiVersion: 'v3' // Default is v2
});

module.exports = function jobDaily () {
    const job = new CronJob('1 * * * * *', async function() {
        await User.find({daily: true})
            .then((response)=>{
                const data = [];
                // console.log('response', response)
                response.forEach((el) => {
                    data.push({email: el.email, accessToken: el.accessToken, storeHash: el.storeHash, clientID: el.clientID});
                })
                return data
            })
            .then((data)=>{
                console.log('data', data);
                data.map((element) => {
                    // console.log('element', element);
                    new BigCommerce({
                        clientId: element.clientID,
                        accessToken: element.accessToken,
                        storeHash: element.storeHash,
                        responseType: 'json',
                        apiVersion: 'v3' // Default is v2
                    }).get('/catalog/products?include=variants')
                        .then(async (data) => {
                            console.log('1', element.email);
                            const dataImportProduct = [];
                            data.data.forEach((el)=>{
                                dataImportProduct.push(...el.variants);
                            })
                            console.log('2', element.email);
                            const writerExport = csvWriter({});
                            writerExport.pipe(fs.createWriteStream(`${element.email}BigCommerce-import-products.csv`));
                            dataImportProduct.map((el)=>{
                                writerExport.write(el);
                            })
                            console.log('3', element.email);
                            writerExport.end();
                            logger.info(`Created file BigCommerce-import-products.csv`);
                            // send mail with defined transport object
                            console.log('4', element.email);
                            const info = await transporter.sendMail({
                                from: '"Sender Name" <kolchinvolodumur@gmail.com>',
                                to: element.email,
                                subject: "Hello from node",
                                text: "Hello world?",
                                html: "<strong>Hello world?</strong>",
                                headers: { 'x-myheader': 'test header' },
                                attachments: [
                                    {
                                        path: `${element.email}BigCommerce-import-products.csv`
                                    }
                                ]
                            });
                            console.log('5', element.email);
                            logger.info(`Send mail: ${info.response}`);
                        })
                })
            })
        console.log('You will see this message every second: jobDaily');
        console.log("moment().format('YYYY-MM-DD').trim()", moment().format().trim());
        logger.info(`Cron (job daily)`);
    }, null, true, 'America/Los_Angeles');
    job.start();
}