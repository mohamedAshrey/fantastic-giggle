const asyncWrapper = require('../middlewares/asyncWrapper');
const AppError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');
const Contact = require('../models/contact.model');

const nodemailer = require('nodemailer');

const contactWithUs = asyncWrapper(async (req, res, next) => {
    const { subject, message } = req.body;
    if (!subject || !message) {
        return next(AppError.create('Subject and message are required', 400, httpStatusText.FAIL));
    }
    console.log(req.user);
    const email = req.user.email;
    const name = req.user.firstName + ' ' + req.user.lastName;

    await Contact.create({ name, email, subject, message });

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

    await transporter.sendMail({
        from: email,
        to: process.env.EMAIL_USER,
        subject: `[CONTACT] ${subject}`,
        html: `
        <p><strong>User:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message}</p>
        `,
    });

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: 'Message sent & saved successfully',
        data: null,
    });
});

module.exports = { contactWithUs };
