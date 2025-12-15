const QRCode = require('qrcode');

const generateQRCode = async (data) => {
    try {
        // Convert data object to JSON string
        const qrData = typeof data === 'string' ? data : JSON.stringify(data);

        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 1,
            margin: 1,
            width: 300,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

module.exports = generateQRCode;