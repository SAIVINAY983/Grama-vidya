const twilio = require('twilio');

const isTwilioConfigured =
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER &&
    process.env.TWILIO_ACCOUNT_SID !== 'your_sid_here';

let client;
if (isTwilioConfigured) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Format Indian phone number to E.164 format (+91XXXXXXXXXX)
 */
const formatPhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    return `+${digits}`;
};

/**
 * Send an SMS message
 * @param {string} toPhone - recipient phone number (10 digits)
 * @param {string} message - SMS body
 * @returns {Promise<{success: boolean, message: string}>}
 */
const sendSMS = async (toPhone, message) => {
    if (!isTwilioConfigured) {
        console.log(`[SMS - No Twilio] To: ${toPhone} | Msg: ${message}`);
        return { success: false, message: 'Twilio not configured — SMS skipped (logged above)' };
    }

    try {
        const formattedPhone = formatPhone(toPhone);
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });
        console.log(`[SMS Sent] To: ${formattedPhone}`);
        return { success: true, message: 'SMS sent successfully' };
    } catch (error) {
        console.error(`[SMS Error] To: ${toPhone}:`, error.message);
        return { success: false, message: error.message };
    }
};

module.exports = { sendSMS, isTwilioConfigured };
