const Blog = require('../models/blogs.model');
const asyncWrapper = require('../middlewares/asyncWrapper');
const httpStatusText = require('../utils/httpStatusText');
const appError = require('../utils/appError');

const get_all_blogs = asyncWrapper( 
    async (req, res) => {
        const query = req.query;
        const limit= query.limit ||10 ;
        const page = query.page ||1 ;
        const skip = (page - 1 )*limit ;

        const blogs = await Blog.find({},{'__v':false })
        .limit(limit).skip(skip).sort({ created_at: -1 });

        res.json({status : httpStatusText.SUCCESS, data : {blogs}});
    }
)

const add_blogs = async (req, res) => {
        try {
            const { title, content, author } = req.body;
            const blog = new Blog({ title, content, author });
            await blog.save();
            res.status(201).json(blog);
        } catch (err) {
            res.status(400).json({ message: 'Failed to add article', error: err });
        }
    }

const get_blog =asyncWrapper( 
    async (req, res,next) => {
            const blog = await Blog.findById(req.params.blogId);
            if (!blog){
                const error = appError.create('blog not found',400,httpStatusText.FAIL)
                return next(error);
            }
            return res.json({ status: httpStatusText.SUCCESS, data: {blog} });
    }
)

const update_blog = asyncWrapper(
    async (req, res, next) => {
        const blogId = req.params.blogId;
        const updatedBlog =await Blog.findByIdAndUpdate(
            blogId, { $set: {...req.body}}, { new: true}
        );
        if (!updatedBlog){
                const error = appError.create('blog not found',400,httpStatusText.FAIL)
                return next(error);
            }
        return res.status(200).json({status: httpStatusText.SUCCESS, data: {blog: updatedBlog}})
    }
)

const delete_blog = asyncWrapper(
    async (req, res, next) => {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.blogId);
        if(!deletedBlog){
            const error = appError.create('blog not found', 400, httpStatusText.FAIL)
            return next(error);
        }
        res.status(200).json({status: httpStatusText.SUCCESS, data: null});
    }
)



module.exports = {
    get_all_blogs,
    get_blog,
    update_blog,
    delete_blog,
    add_blogs
}