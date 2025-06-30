const User = require('../models/users.model');
const asyncWrapper = require('../middlewares/asyncWrapper');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs').promises;

const getAllUsers = asyncWrapper(async (req, res) => {
    const query = req.query;

    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const users = await User.find({}, { __v: false, password: false }).limit(limit).skip(skip);
    res.json({ status: httpStatusText.SUCCESS, data: { users } });
});

const getProfile = asyncWrapper(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId).select('firstName lastName email avatar role');
    if (!user) {
        const error = AppError.create('User not found', 400, httpStatusText.FAIL);
        return next(error);
    }
    res.json({ status: httpStatusText.SUCCESS, data: { user } });
});

const changePassword = asyncWrapper(async (req, res, next) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        const error = AppError.create('User not found', 400, httpStatusText.FAIL);
        return next(error);
    }
    const isMatching = await bcrypt.compare(oldPassword, user.password);

    if (!isMatching) {
        const error = AppError.create('Old Password is incorrect', 400, httpStatusText.FAIL);
        return next(error);
    }

    user.password = await bcrypt.hash(newPassword, 8);
    await user.save();

    res.json({ message: 'Password updated successfully' });
});

const updatedName = asyncWrapper(async (req, res, next) => {
    const userId = req.user.id;
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName },
        { new: true, select: 'firstName lastName' }
    );

    res.json({ message: 'Name updated successfully', user });
});

const updatedAvatar = asyncWrapper(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
        const error = AppError.create('User not found', 400, httpStatusText.FAIL);
        return next(error);
    }
    const newImage = req.file ? req.file.filename : null;

    if (!newImage) {
        const error = AppError.create('No image uploaded', 400, httpStatusText.FAIL);
        return next(error);
    }

    const oldImage = user.avatar;

    if (oldImage && oldImage !== 'defaultPic.jpg') {
        const oldImagePath = path.join(__dirname, '..', 'uploads', oldImage);
        await fs.unlink(oldImagePath);
    }

    user.avatar = newImage;
    await user.save();

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${user.avatar}`;
    res.json({
        message: 'Profile image updated successfully',
        avatar: imageUrl,
    });
});

module.exports = {
    getAllUsers,
    getProfile,
    changePassword,
    updatedName,
    updatedAvatar,
};
