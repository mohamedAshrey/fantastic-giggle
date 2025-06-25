const mongoose = require('mongoose');
const validator = require('validator');
const userRoles = require('../utils/userRoles');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, 'Field must be a valid email address'],
    },
    password: {
        type: String,
    },

    googleId: {
        type: String,
    },

    avatar: {
        type: String,
        default: 'defaultPic.jpg',
    },

    token: {
        type: String,
    },

    otp: {
        type: String,
    },

    otpExpiresAt: {
        type: Date,
    },

    verifiedForReset: {
        type: Boolean,
        default: false,
    },

    emailVerified: {
        type: Boolean,
        default: false,
    },

    role: {
        type: String,
        enum: [userRoles.ADMIN, userRoles.USER, userRoles.MANAGER],
        default: userRoles.USER,
    },
});

module.exports = mongoose.model('User', userSchema);
