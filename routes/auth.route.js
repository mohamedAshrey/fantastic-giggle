const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// جوجل تسجيل دخول
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
// ده اللي هيرجعها بعد تسجيل الدخول بالجيميل بقا
router.get('/google/callback',
    passport.authenticate('google', { session: false }), authController.googleCallback);

module.exports = router;