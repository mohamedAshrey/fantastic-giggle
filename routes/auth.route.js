const express = require('express');
const router = express.Router();
const multer = require('multer');

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        const fileName = `user-${Date.now()}.${ext}`;
        cb(null, fileName);
    },
});

const fileFilter = (req, file, cb) => {
    const imageType = file.mimetype.split('/')[0];

    if (imageType === 'image') {
        return cb(null, true);
    } else {
        return cb(appError.create('File must be an image', 400), false);
    }
};

const upload = multer({
    storage: diskStorage,
    fileFilter,
});

const authController = require('../controllers/auth.controller');

router.post('/register/request', upload.single('avatar'), authController.requestRegistration);

router.post('/register/confirm', authController.confirmRegistration);

router.post('/register/resend-otp', authController.resendOtp);

router.post('/login', authController.login);

router.post('/forget-password', authController.forgetPassword);

router.post('/forgetPass/verify-otp', authController.verifyOtp);

router.post('/reset-password', authController.resetPassword);

router.post('/forget-password/resend-otp', authController.resendForgetOtp);

module.exports = router;
