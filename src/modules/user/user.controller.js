import userModel from "../../../DB/models/user.model.js";
import sendEmail from "../../services/sendEmail.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { AppError } from "../../utils/classError.js";
import { customAlphabet } from "nanoid";
import cartModel from "../../../DB/models/cart.model.js";

//================================ sign up =============================================================
export const signup=asyncHandler(async(req,res,next)=>{
    const {name,email,password,phone,address}=req.body;
    // check if user already exist
    const isExist=await userModel.findOne({email: email});
    if(isExist){
        return res.status(400).json({message:'User already exist'});
    }
    // Generate token and confirmation link
    const token =jwt.sign({email},process.env.confirmationLinkToken,{expiresIn:2*60});
    const link=`${req.protocol}://${req.headers.host}/users/confirm-email/${token}`;

    // Generate token and refresh confirmation link
    const refreshToken = jwt.sign({email},process.env.refreshConfirmationLinkToken,{expiresIn:2*60});
    const refreshLink=`${req.protocol}://${req.headers.host}/users/reconfirm-email/${refreshToken}`;


    
    // Send email with confirmation link
    await sendEmail(email,"Verify your email",`<a href='${link}'>Click here</a><br/> <a href=${refreshLink}>Click heree</a>`);
    
    // hash password
    const hashedPassword= bcrypt.hashSync(password,parseInt(process.env.saltRound));

    // create new user
    const user=await userModel.create({name,email,password:hashedPassword,phone,address})


    // create cart
    const cart =await cartModel.create({user:user._id,products:[]})
    res.status(201).json({message:'User created successfully',user})

        
}) 

export const confirm=asyncHandler(async(req,res,next)=>{
    // we need to transform confirmed value into true in case the user clicked the confirmation link and he is not confirmed yet !
    // we need also to transform the value of the exact user who is trying to signup !! >> so we need a unique att "like email that is on token already "
    const token =req.params.token;
    const decodedToken = jwt.verify(token,process.env.confirmationLinkToken); //it can find email and it can not !!
    if(!decodedToken.email){
        return next(new AppError('Invalid token',401))
    }
    // we need to find the specefic user who should be unconfirmed 

        // check if user is already confirmed

    // now we need to make confirm =true

    const user=await userModel.findOneAndUpdate({email:decodedToken.email,confirmed:false},{confirmed:true},{new:true});
    if(!user){
        return next(new AppError('User NOT found or already confirmed !!',500))

    }
    res.status(200).json({message:'User confirmed successfully',user})
    
})

export const reConfirm=asyncHandler(async(req,res,next)=>{
    // we need to transform confirmed value into true in case the user clicked the confirmation link and he is not confirmed yet !
    // we need also to transform the value of the exact user who is trying to signup !! >> so we need a unique att "like email that is on token already "
    const refreshToken =req.params.refreshToken;
    const decodedToken = jwt.verify(refreshToken,process.env.refreshConfirmationLinkToken); //it can find email and it can not !!
    if(!decodedToken.email){
        return next(new AppError('Invalid token',401))
    }
    // we need to find the specefic user who should be unconfirmed 

        // check if user is already confirmed

    // now we need to make confirm =true

    const user=await userModel.findOneAndUpdate({email:decodedToken.email,confirmed:false},{confirmed:true},{new:true});
    if(!user){
        return res.status(400).json({message:'User NOT found or already confirmed !!'});

    }
    res.status(200).json({message:'User confirmed successfully',user})
    
})

// ================================= Login ============================================================

export const login=asyncHandler(async(req,res,next)=>{
    const {email,password}=req.body;

    // check if user already exist
    const user=await userModel.findOne({email:email.toLowerCase()});
    if(!user){
        return next(new AppError('Invalid Email or password ! '));
    }

    // check if cart exist
    const cart=await cartModel.findOne({user:user._id});
    if(!cart) {
        const cart=await cartModel.create({user:user._id,products:[]});
    }



    // check if password is correct
    const isMatch=bcrypt.compareSync(password,user.password);
    if(!isMatch){
        return next(new AppError('Invalid Email or password ! '));
    }
    // generate token
    const token=jwt.sign({id:user._id,email:user.email},process.env.loginToken,{expiresIn:'3d'});
    await userModel.findOneAndUpdate({email:email},{loggedIn:true});
    return res.status(200).json({message:'Logged in successfully !',token});



    
})

// ================ Forgot Password ===================================
// export const forgetPassword=asyncHandler(async(req,res,next)=>{
//     // we enter our email >> forgot password >> sent otp to the email >> enter otp and new password >> update new password in data base
//     const {email}=req.body;
//     // check if user already exist
//     const user=await userModel.findOne({email:email});
//     if(!user){
//         return next(new AppError('User not found ',500));
//     }

//     // generate OTP
//     const OTP= customAlphabet('0123456789',5);
//     const otpCode=OTP();
//     // Store OTP code in user data and as well the expiration date

//     user.resetPasswordOTP=otpCode;
//     user.resetPasswordOTPExpires=Date.now()+10*60*1000;
//     await user.save();

//     // Sending the OTP code through email 
//     const emailSent=await sendEmail(user.email,"Password reset OTP",`<p>Your OTP is <strong>${otpCode}<br/>if you don't need to reset your password please ignore the email </strong></p>`);
//    if(!emailSent){
//     return next(new AppError('Failed to send OTP, please try again',500));

//    }
//     res.status(200).json({message:'OTP Code sent successfully, please check your email'});

// })

export const forgetPassword=asyncHandler(async(req,res,next)=>{
    // we enter our email >> forgot password >> sent otp to the email >> enter otp and new password >> update new password in data base
    const {email}=req.body;
    // check if user already exist
    const user=await userModel.findOne({email:email});
    if(!user){
        return next(new AppError('User not found ',500));
    }

    // generate token
    const token= jwt.sign({email},process.env.resetPasswordToken,{expiresIn:10*60})
    const link=`${req.protocol}://${req.headers.host}/users/reset-password/${token}`;

    // Sending the reset link through email 
    const emailSent=await sendEmail(user.email,"Password reset ",`<p>TO reset your password :  <a href="${link}"> Click here</a> <br/>if you don't need to reset your password please ignore the email</p>`);
   if(!emailSent){
    return next(new AppError('Failed to send email, please try again',500));

   }
    res.status(200).json({message:'link  sent successfully, please check your email',token});

})

// =================== Verify token Code & reset password ===============
export const resetPassword=asyncHandler(async(req,res,next)=>{
    const token = req.params.token;
    const {newPassword}=req.body;
    // 
    const decodedToken =jwt.verify(token,process.env.resetPasswordToken);
    if(!decodedToken){
        return next(new AppError('Invalid token',401))
    
    }
    
    const user=await userModel.findOne({email:decodedToken.email})
    if(!user){
        return next(new AppError('User not found ',404));
    }
    if(!newPassword){
        return next(new AppError('New password is required ',400));
    }
    // hash the new password
    const hashedPassword=bcrypt.hashSync(newPassword,parseInt(process.env.saltRound));
     user.password=hashedPassword;
     await user.save();
     res.status(200).json({message:'Password reset successfully !'})



    
})

