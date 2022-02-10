'use strict';
const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'StockAssistant@friendsofcommerce.com',
        pass: 'QK0WiVDPjwKeQfVPm9u5lGrC'
    }
});