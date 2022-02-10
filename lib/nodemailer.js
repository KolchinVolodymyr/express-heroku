'use strict';
const nodemailer = require("nodemailer");

//module.exports = nodemailer.createTransport({
//    service: 'gmail',
//    auth: {
//        user: 'StockAssistant@friendsofcommerce.com',
//        pass: 'QK0WiVDPjwKeQfVPm9u5lGrC'
//    },
//    tls: {
//        rejectUnauthorized: false
//    }
//});

module.exports = nodemailer.createTransport({
    host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: 'StockAssistant@friendsofcommerce.com',
            accessToken: 'ya29.A0ARrdaM_UXkA6p5-9dbs_1YRLjl7qGzZk59wjpUB4eDH1NaYT_hWzaevASI47CPum1_WBMTLcNX3erqdZDd8BJa0IL30Mts53gjd5gvWI7bdHeFdjsB_p0meldlu6O5XVVaADt2P4w77I5IpzMW8P2TcY3EOE'
        }
});