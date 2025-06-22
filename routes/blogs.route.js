
const express = require('express');
const router = express.Router();
const blogsController = require('../controllers/blogs.controller');
const verifyToken = require('../middlewares/verifyToken');
const userRoles = require('../utils/userRoles');
const allowedTo = require('../middlewares/allowedTo');


router.route('/')
    .get(verifyToken, blogsController.get_all_blogs)
    .post(verifyToken, blogsController.add_blogs);

router.route('/:blogId')
    .get(verifyToken, blogsController.get_blog)
    .put(verifyToken, blogsController.update_blog)
    .delete(verifyToken, allowedTo(userRoles.ADMIN, userRoles.MANAGER), blogsController.delete_blog);

module.exports = router ;
