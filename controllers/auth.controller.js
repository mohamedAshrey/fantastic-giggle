const jwt = require('jsonwebtoken');
const User = require('../models/users.model');  // تأكد من مسار الموديل عندك

// callback جوجل بعد المصادقة
exports.googleCallback = async (req, res, next) => {
    try {
        // Passport هيحط بيانات المستخدم في req.user
        const user = req.user;

        if (!user) {
            return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
        }

        // بناء الـ payload للتوكن (تحط بيانات بسيطة تكون كافية للتحقق)
        const payload = {
            id: user._id,
            email: user.email
        };

        // إنشاء توكن JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        // ترجع الرد للعميل (ويب أو موبايل)
        return res.json({
            status: 'success',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        next(error);
    }
};