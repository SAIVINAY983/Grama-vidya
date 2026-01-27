require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const testEmail = async () => {
    console.log('Attempting to send test email...');
    console.log('SMTP Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_EMAIL,
        from: process.env.FROM_EMAIL
    });

    try {
        await sendEmail({
            email: process.env.SMTP_EMAIL, // Send to self
            subject: 'Test Email from Gram Vidya Debugger',
            message: 'If you are reading this, the email configuration is CORRECT.'
        });
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Email failed to send.');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('SMTP Response:', error.response);
        }
        if (error.code) {
            console.error('Error Code:', error.code);
        }
    }
};

testEmail();
