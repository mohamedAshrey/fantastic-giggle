const Energy = require('../models/source');
const AppError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');
const asyncWrapper = require('../middlewares/asyncWrapper');

const getAllEnergySource = asyncWrapper(async (req, res) => {
    const query = req.query;
    const limit = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const allSourceOfEnergy = await Energy.find().select('name coverImage').limit(limit).skip(skip);
    res.json({ status: httpStatusText.SUCCESS, data: allSourceOfEnergy });
});

const getEnergyById = asyncWrapper(async (req, res, next) => {
    const sourceOfEnergy = await Energy.findById(req.params.id);
    if (!sourceOfEnergy) {
        const error = AppError.create('Not found this source', 400, httpStatusText.FAIL);
        return next(error);
    }
    return res.json({ status: httpStatusText.SUCCESS, data: { sourceOfEnergy } });
});

module.exports = {
    getAllEnergySource,
    getEnergyById,
};
