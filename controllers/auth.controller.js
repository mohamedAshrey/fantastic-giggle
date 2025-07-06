const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const asyncWrapper = require('../middlewares/asyncWrapper');
const generateJwt = require('../utils/generate.jwt');
const AppError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');
const User = require('../models/users.model');
const userRoles = require('../utils/userRoles');

const pendingRegistrations = new Map();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const requestRegistration = asyncWrapper(async (req, res, next) => {
    const { firstName, lastName, email, password, role, avatar } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(AppError.create('Email already in use', 400, httpStatusText.FAIL));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    pendingRegistrations.set(email, {
        firstName,
        lastName,
        email,
        password,
        role: role || userRoles.USER,
        avatar: req.file ? req.file.filename : 'defaultPic.jpg',
        otp,
        expiresAt,
        lastSentAt: Date.now(),
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your PowerPro Verification Code',
        html: `
        <table style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; font-family: Arial, sans-serif; background-color: #ffffff;">
            <tr>
                <td>
                    <h2 style="color: #2e86de; text-align: center;">PowerPro</h2>
                    <p style="font-size: 16px;">Hello <strong>${firstName}</strong>,</p>
                    <p style="font-size: 15px; line-height: 1.5;">
                        Thank you for registering with <strong>PowerPro</strong>.<br/>
                        Please use the OTP below to verify your email address:
                    </p>
                    <div style="margin: 30px 0; text-align: center;">
                        <span style="font-size: 24px; font-weight: bold; color: #ffffff; background-color: #2e86de; padding: 10px 20px; border-radius: 6px; display: inline-block; letter-spacing: 2px;">
                            ${otp}
                        </span>
                    </div>
                    <p style="font-size: 14px; color: #888;">This OTP will expire in <strong>5 minutes</strong>.</p>
                    <p style="font-size: 13px; color: #999;">
                        If you did not request this, please ignore this message.
                    </p>
                    <p style="margin-top: 30px;">Best regards,<br/><strong>PowerPro Team</strong></p>
                </td>
            </tr>
        </table>
    `,
    });

    res.json({ message: 'OTP sent to your email' });
});

const confirmRegistration = asyncWrapper(async (req, res, next) => {
    const { email, otp } = req.body;

    const pending = pendingRegistrations.get(email);
    if (!pending || pending.otp !== otp || pending.expiresAt < Date.now()) {
        return next(AppError.create('Invalid or expired OTP', 400, httpStatusText.FAIL));
    }

    const hashedPassword = await bcrypt.hash(pending.password, 10);

    const newUser = await User.create({
        firstName: pending.firstName,
        lastName: pending.lastName,
        email,
        password: hashedPassword,
        avatar: pending.avatar,
        role: pending.role,
        emailVerified: true,
    });

    const token = await generateJwt({
        email: newUser.email,
        id: newUser._id,
        role: newUser.role,
    });

    newUser.token = token;
    await newUser.save();
    pendingRegistrations.delete(email);

    res.status(201).json({ message: 'Registration complete', token });
});

const forgotPassword = asyncWrapper(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return next(AppError.create('User not found', 404, httpStatusText.FAIL));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    pendingRegistrations.set(email, {
        otp,
        expiresAt,
        purpose: 'reset-password',
        lastSentAt: Date.now(),
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Code From PowerPro',
        html: `
        <table style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; font-family: Arial, sans-serif; background-color: #ffffff;">
            <tr>
                <td>
                    <h2 style="color:rgb(46, 69, 222); text-align: center;">PowerPro</h2>
                    <p style="font-size: 15px; line-height: 1.5;">
                        Please use the OTP below to verify your email address:
                    </p>
                    <div style="margin: 30px 0; text-align: center;">
                        <span style="font-size: 24px; font-weight: bold; color: #ffffff; background-color: #2e86de; padding: 10px 20px; border-radius: 6px; display: inline-block; letter-spacing: 2px;">
                            ${otp}
                        </span>
                    </div>
                    <p style="font-size: 14px; color: #888;">This OTP will expire in <strong>5 minutes</strong>.</p>
                    <p style="font-size: 13px; color: #999;">
                        If you did not request this, please ignore this message.
                    </p>
                    <p style="margin-top: 30px;">Best regards,<br/><strong>PowerPro Team</strong></p>
                </td>
            </tr>
        </table>
    `,
    });

    res.json({ message: 'OTP sent to your email' });
});

const resetPassword = asyncWrapper(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;

    const pending = pendingRegistrations.get(email);
    if (
        !pending ||
        pending.otp !== otp ||
        pending.expiresAt < Date.now() ||
        pending.purpose !== 'reset-password'
    ) {
        return next(AppError.create('Invalid or expired OTP', 400, httpStatusText.FAIL));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(AppError.create('User not found', 404, httpStatusText.FAIL));
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    pendingRegistrations.delete(email);

    res.json({ message: 'Password reset successful' });
});

const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return next(AppError.create('User not found', 404, httpStatusText.FAIL));
    }

    if (!user.emailVerified) {
        return next(AppError.create('Email not verified', 403, httpStatusText.FAIL));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(AppError.create('Invalid password', 401, httpStatusText.FAIL));
    }

    const token = await generateJwt({
        email: user.email,
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
    });

    user.token = token;
    await user.save();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: 'Login successful',
        data: {
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                role: user.role,
            },
        },
    });
});

const resendOtp = asyncWrapper(async (req, res, next) => {
    const { email } = req.body;

    const pending = pendingRegistrations.get(email);

    if (!pending) {
        return next(
            AppError.create(
                'No pending registration found for this email',
                404,
                httpStatusText.FAIL
            )
        );
    }

    const now = Date.now();
    const cooldown = 60 * 1000;

    if (pending.lastSentAt && now - pending.lastSentAt < cooldown) {
        const secondsLeft = Math.ceil((cooldown - (now - pending.lastSentAt)) / 1000);
        return next(
            AppError.create(
                `Please wait ${secondsLeft}s before requesting another OTP`,
                429,
                httpStatusText.FAIL
            )
        );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    pending.otp = otp;
    pending.expiresAt = expiresAt;
    pendingRegistrations.set(email, pending);

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your PowerPro Verification Code',
        html: `
            <table style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; font-family: Arial, sans-serif; background-color: #ffffff;">
                <tr>
                    <td>
                        <h2 style="color: #2e86de; text-align: center;">PowerPro</h2>
                        <p style="font-size: 16px;">Hello <strong>${pending.firstName}</strong>,</p>
                        <p style="font-size: 15px; line-height: 1.5;">
                            You requested a new OTP.<br/>
                            Please use the OTP below to verify your email address:
                        </p>
                        <div style="margin: 30px 0; text-align: center;">
                            <span style="font-size: 24px; font-weight: bold; color: #ffffff; background-color: #2e86de; padding: 10px 20px; border-radius: 6px; display: inline-block; letter-spacing: 2px;">
                                ${otp}
                            </span>
                        </div>
                        <p style="font-size: 14px; color: #888;">This OTP will expire in <strong>5 minutes</strong>.</p>
                        <p style="font-size: 13px; color: #999;">
                            If you did not request this, please ignore this message.
                        </p>
                        <p style="margin-top: 30px;">Best regards,<br/><strong>PowerPro Team</strong></p>
                    </td>
                </tr>
            </table>
        `,
    });

    pending.lastSentAt = Date.now();
    pendingRegistrations.set(email, pending);

    res.json({ message: 'OTP re-sent to your email' });
});

const resendForgotOtp = asyncWrapper(async (req, res, next) => {
    const { email } = req.body;

    const pending = pendingRegistrations.get(email);

    if (!pending || pending.purpose !== 'reset-password') {
        return next(
            AppError.create('No pending reset OTP found for this email', 404, httpStatusText.FAIL)
        );
    }

    const now = Date.now();
    const cooldown = 60 * 1000;

    if (pending.lastSentAt && now - pending.lastSentAt < cooldown) {
        const secondsLeft = Math.ceil((cooldown - (now - pending.lastSentAt)) / 1000);
        return next(
            AppError.create(
                `Please wait ${secondsLeft}s before requesting another OTP`,
                429,
                httpStatusText.FAIL
            )
        );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    pending.otp = otp;
    pending.expiresAt = expiresAt;
    pendingRegistrations.set(email, pending);

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Code From PowerPro',
        html: `
            <table style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; font-family: Arial, sans-serif; background-color: #ffffff;">
                <tr>
                    <td>
                        <h2 style="color: #2e86de; text-align: center;">PowerPro</h2>
                        <p style="font-size: 15px; line-height: 1.5;">
                            You requested a new OTP to reset your password.<br/>
                            Please use the code below:
                        </p>
                        <div style="margin: 30px 0; text-align: center;">
                            <span style="font-size: 24px; font-weight: bold; color: #ffffff; background-color: #2e86de; padding: 10px 20px; border-radius: 6px;">
                                ${otp}
                            </span>
                        </div>
                        <p style="font-size: 14px; color: #888;">This OTP will expire in <strong>5 minutes</strong>.</p>
                        <p style="font-size: 13px; color: #999;">If you didn't request this, please ignore.</p>
                        <p style="margin-top: 30px;">Best regards,<br/><strong>PowerPro Team</strong></p>
                    </td>
                </tr>
            </table>
        `,
    });

    pending.lastSentAt = Date.now();
    pendingRegistrations.set(email, pending);

    res.json({ message: 'OTP resent for password reset' });
});

module.exports = {
    requestRegistration,
    confirmRegistration,
    forgotPassword,
    resetPassword,
    login,
    resendOtp,
    resendForgotOtp,
};
