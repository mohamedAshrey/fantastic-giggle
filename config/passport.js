const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/users.model');
require('dotenv').config(); 

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, 
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
      // لو مش موجود، حاول ندور بالإيميل
        user = await User.findOne({ email: profile.emails[0].value });
        }
        if (!user) {
      // لو مش لاقيه، نعمل حساب جديد
        user = new User({
            googleId: profile.id,
            firstName: profile.name?.givenName || 'NoFirstName',
            lastName: profile.name?.familyName || 'NoLastName',
            email: profile.emails[0].value,
            password: ''  // التسجيل بالجيميل، فمش محتاج باسورد
        });
        await user.save();
    } else if (!user.googleId) {
      // لو لاقيناه لكن مش مسجل جوجل اي دي، نحدثه
        user.googleId = profile.id;
        await user.save();
    }
    done(null, user);
    } catch (err) {
    done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;