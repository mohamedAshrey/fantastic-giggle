const Tips = require('../models/tips.model');
const AppError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');
const asyncWrapper = require('../middlewares/asyncWrapper');

const getAllTips = asyncWrapper(async (req, res) => {
    const query = req.query;
    const limit = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const allTips = await Tips.find()
        .select('title shortDescription image')
        .limit(limit)
        .skip(skip);
    res.json({ status: httpStatusText.SUCCESS, data: { allTips } });
});

const getTipById = asyncWrapper(async (req, res) => {
    const tipID = req.params.id;
    const tip = await Tips.findById(tipID);
    if (!tip) {
        const error = AppError.create('Not found this tip', 400, httpStatusText.FAIL);
        return next(error);
    }
    return res.json({ status: httpStatusText.SUCCESS, data: { tip } });
});

module.exports = {
    getAllTips,
    getTipById,
};
