const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    try {
        let token;

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
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }
};

// Check user types
exports.isPublic = (req, res, next) => {
    if (req.user.userType !== 'public') {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }
    next();
};

exports.isPrintingPress = (req, res, next) => {
    if (req.user.userType !== 'printing-press') {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }
    next();
};

exports.isPMC = (req, res, next) => {
    if (req.user.userType !== 'pmc') {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }
    next();
};

exports.isRecycler = (req, res, next) => {
    if (req.user.userType !== 'recycler') {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }
    next();
};