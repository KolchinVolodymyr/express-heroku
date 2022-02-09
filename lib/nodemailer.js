'use strict';
const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
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