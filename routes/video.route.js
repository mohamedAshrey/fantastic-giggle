const express = require('express');
const router = express.Router();
const videosController = require('../controllers/video.controller');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, videosController.getAllVideos);

router.get('/:id', verifyToken, videosController.getVideoById);

module.exports = router;
