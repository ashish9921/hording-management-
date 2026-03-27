// src/utils/notificationHelper.js
// Uses Expo Push Notification Service (no Firebase Admin SDK needed!)

const axios = require('axios');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Send push notification to a list of Expo push tokens
 * @param {string[]} tokens - Array of Expo push tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Extra data (for navigation on tap)
 */
const sendPushNotification = async (tokens, title, body, data = {}) => {
    // Filter out null/undefined tokens
    const validTokens = tokens.filter(t => t && t.startsWith('ExponentPushToken'));

    if (validTokens.length === 0) {
        console.log('No valid push tokens found, skipping notification');
        return;
    }

    const messages = validTokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
        android: {
            channelId: 'complaints',
            priority: 'high',
        }
    }));

    try {
        const response = await axios.post(EXPO_PUSH_URL, messages, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        console.log('✅ Push notification sent:', response.data);
    } catch (error) {
        console.error('❌ Push notification error:', error.message);
    }
};

module.exports = { sendPushNotification };