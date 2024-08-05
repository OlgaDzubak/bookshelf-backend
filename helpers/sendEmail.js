const sgMail = require('@sendgrid/mail');
require("dotenv").config();

const {SENDGRID_API_KEY} = process.env;
sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (data) => {
    const email = { ...data, from: "natalata81@gmail.com" };  // поміняти email на email адміністратора бази або email звідки буде надходити розсилка
    await sgMail.send(email);
    return true;
};
module.exports = sendEmail;