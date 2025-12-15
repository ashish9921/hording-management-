const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: `User type ${req.user.userType} is not authorized to access this route`
            });
        }
        next();
    };
};

// Specific role middlewares
exports.isPrintingPress = (req, res, next) => {
    if (req.user.userType !== 'printing_press') {
        return res.status(403).json({
            success: false,
            message: 'Only printing press users can access this route'
        });
    }
    next();
};

exports.isPMC = (req, res, next) => {
    if (req.user.userType !== 'pmc') {
        return res.status(403).json({
            success: false,
            message: 'Only PMC officers can access this route'
        });
    }

    if (req.user.verificationStatus !== 'approved') {
        return res.status(403).json({
            success: false,
            message: 'Your PMC account is not yet verified'
        });
    }

    next();
};

exports.isPublic = (req, res, next) => {
    if (req.user.userType !== 'public') {
        return res.status(403).json({
            success: false,
            message: 'Only public users can access this route'
        });
    }
    next();
};

exports.isRecycler = (req, res, next) => {
    if (req.user.userType !== 'recycler') {
        return res.status(403).json({
            success: false,
            message: 'Only recyclers can access this route'
        });
    }
    next();
};