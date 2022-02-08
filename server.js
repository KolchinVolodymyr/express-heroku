const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const csvWriter = require('csv-write-stream');
const CronJob = require('cron').CronJob;
const moment = require("moment");
require('dotenv').config();
const mongoose = require("mongoose");
const fetch = require('node-fetch');
const User = require('./schema');
const transporter = require('./lib/nodemailer');

const connectToMongo = async() => {
    await mongoose.connect(process.env.URL, { useUnifiedTopology: true, useNewUrlParser: true}, function(err){
        if(err) return console.log(err);
    });
    return mongoose;
};
connectToMongo();

app.use(cors());
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
//parse application/json
app.use(bodyParser.json())

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
    console.log("Message sent: %s", info.response);
});

app.post('/subscribe',async (req, res) => {
    res.send("Hello World! Subscribe!!!");
    console.log('req.body', req.body);
    // req.body.form.unsubscribe
    await User.find({email: req.body.form.email})
    .then((data)=>{
        if(req.body.form.unsubscribe === true) {
            User.deleteMany({unsubscribe: true})
                .then((res) => { console.log('res', res) })
                .catch((err) => { console.log('error', err) })
            return;
        }
        if(data.length === 0) {
            //User not found
            User.create({
                email: req.body.form.email,
                daily: req.body.form.daily,
                weekly: req.body.form.weekly,
                workingDay: req.body.form.workingDay,
                monthly: req.body.form.monthly,
                unsubscribe: req.body.form.unsubscribe,
            },
            function(err, doc){
                if(err) return console.log(err);
                console.log("Object saves user...", doc);
            });
        } else {
            console.log('user found');
            User.updateOne({ email: req.body.form.email }, { $set: req.body.form } )
            .then((res) => { console.log('res', res) })
            .catch((err) => { console.log('error', err) })
        }
    })
});

// start the Express server
app.listen(process.env.PORT || 8080, () => {
    console.log(`Server started at`);
});