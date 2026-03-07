const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const sendEmail = require('./utils/sendEmail');

async function test() {
    console.log('Testing email send with:');
    console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL);
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);

    try {
        await sendEmail({
            email: process.env.SMTP_EMAIL,
            subject: 'Test Email Verification',
            message: 'This is a test to verify Nodemailer is working.'
        });
        console.log('SUCCESS: Email sent successfully!');
    } catch (err) {
        console.error('FAILED: Could not send email.');
        console.error(err);
    }
}

test();
