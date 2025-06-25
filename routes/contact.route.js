const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verifyToken');
const { contactWithUs } = require('../controllers/contact.controller');

router.post('/', verifyToken, contactWithUs);

module.exports = router;
