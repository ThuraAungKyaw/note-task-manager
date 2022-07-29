const sgMail = require("@sendgrid/mail");
const sendgridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeEmail = (email, name) => {
    try {
        sgMail.send({
            to: email,
            from: "thuraaungkyaw9@gmail.com",
            subject: "Thanks for joining us!",
            text: `Welcome abroad, ${name}! Let me know how you get along with the app!`
        })
    } catch (e) {
        console.log(e.message)
    }
}

const sendCancelEmail = (email, name) => {
    try {
        sgMail.send({
            to: email,
            from: "thuraaungkyaw9@gmail.com",
            subject: "Account Cancelled!",
            text: `We're so sorry to see you go, ${name}! How could we may have served you differently to keep you onboard?`
        })
    } catch (e) {
        console.log(e.message)
    }
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}