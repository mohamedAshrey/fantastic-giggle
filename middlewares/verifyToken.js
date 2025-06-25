const jwt = require('jsonwebtoken');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['Authorization'] || req.headers['authorization'];
    if (!authHeader) {
        const error = AppError.create('token is required', 401, httpStatusText.ERROR);
        return next(error);
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        const error = AppError.create('Invalid Token', 401, httpStatusText.ERROR);
        return next(error);
    }
};

module.exports = verifyToken;
