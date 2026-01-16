exports.generateBookingId = () => {
    return 'BK' + Date.now().toString().slice(-7);
};

exports.generateComplaintId = () => {
    return 'CMP' + Date.now().toString().slice(-6);
};

exports.generateCollectionId = () => {
    return 'COL' + Date.now().toString().slice(-6);
};

exports.generateHoardingId = () => {
    return 'H' + Date.now().toString().slice(-5);
};