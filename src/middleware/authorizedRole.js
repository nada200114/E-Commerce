import { AppError } from "../utils/classError.js";


 const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('Access Denied, You do not have the permission to access this resource!', 403));
        }
        next();
    }


}


export default authorizeRole;