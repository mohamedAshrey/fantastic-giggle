const { body } = require('express-validator');

const requestSchema = () => [body('email').isEmail().withMessage('Enter a valid email')];
const verifySchema = () => [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('otp').notEmpty().withMessage('OTP is required'),
];
const confirmSchema = () => [
    body('email').isEmail().withMessage('Email is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

module.exports = {
    requestSchema,
    verifySchema,
    confirmSchema,
};
