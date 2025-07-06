const Video = require('../models/video');
const appError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');
const asyncWrapper = require('../middlewares/asyncWrapper');

const getAllVideos = asyncWrapper(async (req, res) => {
    const query = req.query;
    const limit = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const allvideos = await Video.find().select('title thumbnailUrl').limit(limit).skip(skip);
    res.json({ status: httpStatusText.SUCCESS, data: { allvideos } });
});

const getVideoById = asyncWrapper(async (req, res) => {
    const vidID = req.params.id;
    const video = await Video.findById(vidID);
    if (!video) {
        const error = AppError.create('Not found this video', 400, httpStatusText.FAIL);
        return next(error);
    }
    return res.json({ status: httpStatusText.SUCCESS, data: { video } });
});

module.exports = {
    getAllVideos,
    getVideoById,
};
