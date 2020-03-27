const nodemailer    = require('nodemailer'),
      config        = require('./config.json');

let transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port == 465,
    auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.pass
    }
});

const send = async function(subject, text) {
    try {
        const info = await transporter.sendMail({
            from    : `"${config.mail.name}" <${config.mail.addr}>`,
            to      : config.mail.recipients.join(', '),
            subject : subject,
            text    : text
        });

        console.info(`[ EML ] Message sent: ${info.messageId}`);
    } catch(err) {
        console.error(`[ EML ] Error: ${err.response}`);
    }
}

const alertSilence  = () => send('Dead Air ⚠️', 'Silence was detected on the stream.'),
      alertSound    = () => send('Back On Air 📻', 'Sound was detected on the stream.'),

      //  TODO: send mail on errors
      alertError    = () => send('Error 🛑', 'Stream threw an error.');

exports.alertSilence    = alertSilence;
exports.alertSound      = alertSound;
exports.alertError      = alertError;