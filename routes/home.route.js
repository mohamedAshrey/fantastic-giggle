const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, homeController.getHomeData);

module.exports = router;
