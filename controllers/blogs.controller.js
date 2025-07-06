const Blog = require('../models/blogs.model');
const asyncWrapper = require('../middlewares/asyncWrapper');
const httpStatusText = require('../utils/httpStatusText');
const appError = require('../utils/appError');

const get_all_blogs = asyncWrapper(async (req, res) => {
    const query = req.query;
    const limit = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find().select('title image').limit(limit).skip(skip);
    res.json({ status: httpStatusText.SUCCESS, data: { blogs } });
});

const get_blog = asyncWrapper(async (req, res, next) => {
    const blogID = req.params.id;
    const blog = await Blog.findById(blogID);
    if (!blog) {
        const error = appError.create('blog not found', 400, httpStatusText.FAIL);
        return next(error);
    }
    return res.json({ status: httpStatusText.SUCCESS, data: { blog } });
});

module.exports = {
    get_all_blogs,
    get_blog,
};
