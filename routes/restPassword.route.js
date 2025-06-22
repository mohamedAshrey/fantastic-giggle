const express = require('express');
const { 
    requestSchema,
    verifySchema,
    confirmSchema  } = require('../middlewares/validationSchema.js');
const router = express.Router();
const restController = require('../controllers/restPassword.controller');


router.post('/reset-password/request', requestSchema, restController.sendResetOTP );

router.post('/reset-password/verify', verifySchema, restController.verifyOTP );

router.post('/reset-password/confirm', confirmSchema, restController.resetPassword );

module.exports = router;