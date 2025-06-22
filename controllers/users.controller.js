
const User = require('../models/users.model');
const asyncWrapper = require('../middlewares/asyncWrapper');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateJwt = require('../utils/generate.jwt');
const path = require('path');
const fs = require('fs').promises;



const getAllUsers = asyncWrapper(
    async (req, res)=>{
        const query = req.query;

        const limit = query.limit ||10 ;
        const page = query.page || 1 ;
        const skip = (page - 1)*limit;

        const users = await User.find({},{"__v":false , "password" : false}).limit(limit).skip(skip);
        res.json({status : httpStatusText.SUCCESS , data : {users}});
    }
)

const register = asyncWrapper(
    async (req,res,next)=>{
        const { firstName, lastName, email, password, role }= req.body;
        const oldUser =await User.findOne({email : email})
        if(oldUser){
            const error = AppError.create("user already exist",400,httpStatusText.FAIL);
            return next(error);
        }
        //password hashing
        const hashedPassword = await bcrypt.hash(password,8);
        
        const newUser = new User({
            firstName,
            lastName,
            email,
            password : hashedPassword,
            role,
            avatar: req.file.filename
        });
        const token = await generateJwt({email: newUser.email, id: newUser._id, role: newUser.role, firstName: newUser.firstName, lastName: newUser.lastName});
        newUser.token = token;
        
        await newUser.save();
        res.status(201).json({status : httpStatusText.SUCCESS ,data : {user : newUser}});
    }
)

const logIn = asyncWrapper(
    async (req,res,next)=>{
        const {email , password} = req.body ;
        if(!email){
            const error = AppError.create("Email is required" , 400 , httpStatusText.FAIL)
            return next(error)
        }
        if(!password){
            const error = AppError.create("Password is required" , 400 , httpStatusText.FAIL)
            return next(error)
        }
        const userLogin = await User.findOne({email : email});
        if(!userLogin){
            const error = AppError.create("user not found",400 ,httpStatusText.FAIL);
            return next(error);
        }
        const passwordLogin = await bcrypt.compare(password,userLogin.password);
        
        if(userLogin && !passwordLogin){
            const error = AppError.create("password is incorrect",400 ,httpStatusText.FAIL);
            return next(error);
        }
        if(userLogin&&passwordLogin){
            const token = await generateJwt({email: userLogin.email, id : userLogin._id, role: userLogin.role, firstName: userLogin.firstName, lastName: userLogin.lastName})
            return res.json({ status : httpStatusText.SUCCESS , data : {token}});
        } else{
            const error = AppError.create("ERROR",500 ,httpStatusText.ERROR);
            return next(error);
        }
});

const getProfile = asyncWrapper(async(req, res, next)=>{
    const userId = req.user.id ;
    const user = await User.findById(userId).select('firstName lastName email avatar');
    if(!user){
        return res.status(404).json({ message: 'User not found'});
    }
    res.json({status : httpStatusText.SUCCESS , data : {user}});
});

const changePassword = asyncWrapper(
    async(req, res, next)=>{
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        
        const user = await User.findById(userId);

        if(!user) return res.status(400).json({ message: 'User not found'});
        
        const isMatching = await bcrypt.compare(oldPassword, user.password);
        if(!isMatching) return res.status(400).json({ message: 'Old Password is incorrect'});

        user.password = await bcrypt.hash(newPassword, 8);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    
    }
)

const updatedName = asyncWrapper(
    async(req, res, next)=>{
        const userId = req.user.id;
        const { firstName, lastName } = req.body;
        
        const user = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName },
            { new: true, select: 'firstName lastName' }
        );

        res.json({ message: 'Name updated successfully', user });
    }
);

const updatedAvatar = asyncWrapper(
  async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newImage = req.file ? req.file.filename : null;
    if (!newImage) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const oldImage = user.avatar;

    // 🧹 حذف الصورة القديمة إن لم تكن default
    if (oldImage && oldImage !== 'defaultPic.jpg') {
        const oldImagePath = path.join(__dirname, '..', 'uploads', oldImage);
        await fs.unlink(oldImagePath);
    }

    user.avatar = newImage;
    await user.save();

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${user.avatar}`;
    res.json({
      message: '✅ Profile image updated successfully',
      avatar: imageUrl
    });
  }
);



module.exports = {
    getAllUsers ,
    register ,
    logIn,
    getProfile,
    changePassword,
    updatedName,
    updatedAvatar
}