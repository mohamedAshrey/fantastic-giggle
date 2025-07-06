const express = require('express');
const router = express.Router();
const tipsController = require('../controllers/tips.controller');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, tipsController.getAllTips);
router.get('/:id', tipsController.getTipById);

module.exports = router;
