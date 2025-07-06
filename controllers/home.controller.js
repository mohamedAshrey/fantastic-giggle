const Energy = require('../models/source');
const Tips = require('../models/tips.model');
const Video = require('../models/video');
const Blog = require('../models/blogs.model');
const AppError = require('../utils/appError');
const httpStatusText = require('../utils/httpStatusText');
const asyncWrapper = require('../middlewares/asyncWrapper');

const getHomeData = asyncWrapper(async (req, res) => {
    const [sources, tips, blogs, videos] = await Promise.all([
        Energy.find().select('coverImage').limit(3),
        Tips.find().select('title image').limit(3),
        Blog.find().select('title image').limit(3),
        Video.find().select('title thumbnailUrl').limit(3),
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            sources,
            tips,
            blogs,
            videos,
        },
    });
});

module.exports = { getHomeData };
