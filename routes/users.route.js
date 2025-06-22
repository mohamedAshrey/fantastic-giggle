const express = require('express');
const router = express.Router();

const multer = require('multer');

const diskStorage = multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null, 'uploads');
    },
    filename: (req, file, cb)=> {
        const ext = file.mimetype.split('/')[1];
        const fileName = `user-${Date.now()}.${ext}`;
        cb(null, fileName)
    }
})

const fileFilter = (req, file, cb)=> {
    const imageType = file.mimetype.split('/')[0];

    if(imageType === 'image'){
        return cb(null, true)
    } else {
        return cb(appError.create('File must be an image',400),false)
    }
}

const upload = multer({
    storage: diskStorage,
    fileFilter
})


const userController = require('../controllers/users.controller');
const verifyToken = require('../middlewares/verifyToken');
const appError = require('../utils/appError');

router.route('/')
            .get(verifyToken, userController.getAllUsers);

router.route('/register')
            .post(upload.single('avatar'), userController.register);

router.route('/login')
            .post(userController.logIn);

router.route('/profile')
            .get(verifyToken,userController.getProfile);

router.route('/change-password')
            .put(verifyToken, userController.changePassword);

router.route('/updated-name')
            .put(verifyToken, userController.updatedName);

router.route('/updated-image')
            .put(verifyToken, upload.single('avatar'), userController.updatedAvatar);

module.exports = router ;