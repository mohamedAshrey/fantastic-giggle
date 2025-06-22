const appError = require("../utils/appError")

module.exports = (...roles) => {
    return(req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(appError.create('this role is not auth', 401))
        }
        next();
    }
}