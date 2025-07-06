const express = require('express');
const router = express.Router();
const energyController = require('../controllers/energySource.controller');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, energyController.getAllEnergySource);
router.get('/:id', energyController.getEnergyById);

module.exports = router;
