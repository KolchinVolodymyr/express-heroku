'use strict';
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const csvWriter = require('csv-write-stream');
require('dotenv').config();
const mongoose = require("mongoose");
const fetch = require('node-fetch');
const User = require('./schema');
const transporter = require('./lib/nodemailer');
const logger = require('./configs/logger');
const jobDaily = require('./cron/job-daily');
const workingDay = require('./cron/job-workingDay');
const weekly = require('./cron/job-weekly');
const monthly = require('./cron/job-monthly');

const connectToMongo = async() => {
    await mongoose.connect(process.env.URL, { useUnifiedTopology: true, useNewUrlParser: true}, function(err){
        if(err) {
            logger.info(`Error(Connect mongodb): ${err}`);
        }
    });
    logger.info(`Mongoose connect`);
    return mongoose;
};
connectToMongo();

jobDaily();
workingDay();
weekly();
monthly();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hello World!123");
    User.find({daily: true}).then((data)=>{
        console.log('daily data', data);
    })
    User.find({workingDay: true}).then((data)=>{
        console.log('workingDay data', data);
    })
});

//test
app.post('/', (req, res) => {
    res.send("Hello World!123");
    console.log('req.body', req.body);
    User.create({
        name: "Tom",
        email: req.body.form.email,
        daily: req.body.form.daily,
        weekly: req.body.form.weekly,
        context: req.body.context
    },
    function(err, doc){
        // mongoose.disconnect();
        if(err) return console.log(err);
        console.log("Saves object user", doc);
    });
});

app.post( "/send", cors(), async ( req, res ) => {
    res.send( "Hello Email! /send(POST)" );
    console.log('req.body', req.body);
    console.log('req.body.email', req.body.formEmail.email);
    const data = req.body.dataSCV;
    const writerExport = csvWriter({});
    writerExport.pipe(fs.createWriteStream('BigCommerce-import-products.csv'));
    data.map((el)=>{
        writerExport.write(el);
    })
    writerExport.end();
    logger.info(`Created file BigCommerce-import-products.csv`);

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"Sender Name" <kolchinvolodumur@gmail.com>',
        to: req.body.formEmail.email,
        subject: "Hello from node",
        text: "Hello world?",
        html: "<strong>Hello world?</strong>",
        headers: { 'x-myheader': 'test header' },
        attachments: [
            {
                path: './file.csv'
            }
        ]
    });
    logger.info(`Send mail: ${info.response}`);
});

app.post('/subscribe',async (req, res) => {
    res.send("Hello World! Subscribe!!!");
    console.log('req.body', req.body);
    // req.body.form.unsubscribe
    await User.find({email: req.body.form.email})
    .then((data)=>{
        if(req.body.form.unsubscribe === true) {
            User.deleteMany({unsubscribe: true})
                .then((res) => {
                    logger.info(`Delete user: ${req.body.form.email}`);
                })
                .catch((err) => {
                    logger.info(`Error(Delete user): ${err}`);
                })
            return;
        }
        if(data.length === 0) {
            User.create({
                email: req.body.form.email,
                daily: req.body.form.daily,
                weekly: req.body.form.weekly,
                workingDay: req.body.form.workingDay,
                monthly: req.body.form.monthly,
                unsubscribe: req.body.form.unsubscribe,
            },
            function(err, doc){
                if(err) {
                    return logger.info(`Error(Created user): ${err}`);
                }
                logger.info(`Created user: ${doc.email}`);
            });
        } else {
            User.updateOne({ email: req.body.form.email }, { $set: req.body.form } )
            .then((res) => {
                logger.info(`Update user: ${req.body.form.email}`);
            })
            .catch((err) => {
                logger.info(`Error(update users): ${err}`);
            })
        }
    })
});

// start the Express server
app.listen(process.env.PORT || 8080, () => {
    console.log('Server started at');
    logger.info('Server started at');
});