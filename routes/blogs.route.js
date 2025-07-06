const express = require('express');
const router = express.Router();

const blogsController = require('../controllers/blogs.controller');
const verifyToken = require('../middlewares/verifyToken');

router.route('/').get(verifyToken, blogsController.get_all_blogs);
router.route('/:id').get(verifyToken, blogsController.get_blog);

module.exports = router;
