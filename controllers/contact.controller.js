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
        from: `"Support Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Power Pro Support',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; background-color: #ffffff;">
        <h2 style="color: #333; font-weight: normal;">Hello ${name},</h2>
        <p style="font-size: 15px; color: #444;">
        Thank you for reaching out. We've received your message and will get back to you as soon as possible.
        </p>
        <h3 style="margin-top: 30px; color: #555;">Message details:</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message}</p>
        <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 50px;">
        © ${new Date().getFullYear()} Powerpro. All rights reserved.
        </p>
</div>
`,
    });

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: 'We will comunication with you ASAP',
        data: null,
    });
});

module.exports = { contactWithUs };
