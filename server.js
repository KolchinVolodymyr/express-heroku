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
const Schema = mongoose.Schema;
const fetch = require('node-fetch');


const userScheme = new Schema({name: String, email: String, daily: Boolean, weekly: Boolean, context:String}, {versionKey: false});
const User = mongoose.model("User", userScheme);

const connectToMongo = async() => {
    await mongoose.connect(process.env.URL, { useUnifiedTopology: true, useNewUrlParser: true}, function(err){
        if(err) return console.log(err);
//        app.listen(process.env.PORT || 8080, function(){
//            console.log("Server started at...");
//        });
    });
    return mongoose;
};
connectToMongo();



const transporter = nodemailer.createTransport({
    host: 'smtp.elasticemail.com',
    port: 2525,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'kolchinvolodumur@gmail.com',
        pass: '953C273D6C87057CD98FD08E305DDBFADFD0',
    },
    logger: true
});


app.use(cors());
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
//parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send("Hello World!123");
    // User.find({ $or: [ { weekly: true } ] }, function (err, docs) {
    //     console.log('err', err);
    //     docs.forEach((el)=> {
    //         console.log('el', el);
    //     })
    // })
    // User.find({email: 'KolchinVolo@gmail.com'}, function (err, docs) {
    //     console.log('err', err);
    //     docs.forEach((el)=> {
    //         console.log('el', el);
    //     })
    // });
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
                console.log("Сохранен объект user", doc);
        });
});

app.post( "/send", cors(), async ( req, res ) => {
    res.send( "Hello Email!" );
    console.log('req.body', req.body);
    console.log('req.body.email', req.body.formEmail.email);
    const data = req.body.dataSCV;
    const writerExport = csvWriter({});

    writerExport.pipe(fs.createWriteStream('file.csv'));
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
            {   // utf-8 string as an attachment
                filename: 'text1.txt',
                content: 'hello world!'
            },
            {   // binary buffer as an attachment
                filename: 'text2.txt',
                content: new Buffer('hello world!','utf-8')
            },
            {
                path: './file.csv'
            }
        ]
    });
    console.log("Message sent: %s", info.response);
});

// const PORT = process.env.PORT || 8080;
// // start the Express server
app.listen(process.env.PORT || 8080, () => {
    console.log( `server started at` );
});

