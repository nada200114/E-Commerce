import jwt from 'jsonwebtoken'
import userModel from '../../DB/models/user.model.js';
import { AppError } from '../utils/classError.js';


 const auth=()=>{
    return async(req,res,next)=>{
        const {token}=req.headers;

        if(!token){
            return next(new AppError('token not found',400))
        }

        const decodedToken=jwt.verify(token,process.env.loginToken);
        if(!decodedToken){
            return next(new AppError('Invalid payload',401))
        }


        const user=await userModel.findOne({email:decodedToken.email});
        if(!user){
            return res.status(400).json({message:'User NOT found'});

        }
      if (user.resetPasswordOTPExpires && parseInt(user?.resetPasswordOTPExpires?.getTime() / 1000) > decodedToken.iat) {
        return next(new AppError('Token expired, please login again.', 401));
      }

req.user=user;
next()

    }

}

export default auth;