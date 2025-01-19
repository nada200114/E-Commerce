import CouponModel from "../../../DB/models/coupon.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
// ======================== Get all Coupons ==================================================
export const getAllCoupons=asyncHandler(async(req,res,next)=>{
    
    const coupons=await CouponModel.find({});
    if(coupons.length==0) return next(new AppError("No Coupons found !"));
    res.status(200).json({message:'Coupons fetched successfully', coupons});    
});
// ======================== get coupon by id =================================================

export const getCouponById=asyncHandler(async(req,res,next)=>{
    const {couponId}=req.params;
    // check if coupon is exist
    const coupon=await CouponModel.findById(couponId);
    if(!coupon){
        return next(new Error('Coupon not found!'));
    }
    res.status(200).json({message:'Coupon fetched successfully', coupon});

    
    
});

// ======================== create coupon by id ==============================================
export const createCoupon=asyncHandler(async(req,res,next)=>{
    const {code, amount, fromDate,toDate }=req.body;
    // check if coupon already exist
    const couponExist=await CouponModel.findOne({code:code.toLowerCase()});
    if(couponExist){
        return next(new Error('Coupon already exist !'));
    }
//    create a new coupon
    const coupon=await CouponModel.create({
        code:code.toLowerCase(),
        amount,
        fromDate,
        toDate,
        createdBy:req.user._id,
  
    })

    res.status(201).json({message:'Coupon created successfully', coupon});
    

    

})
// ======================== update coupon by id ==============================================
export const updateCoupon=asyncHandler(async(req,res,next)=>{
    const {couponID}=req.params;
    const {code, amount, fromDate,toDate }=req.body;
    // check if coupon is exist
    const coupon=await CouponModel.findById(couponID);

    if(!coupon){
        return next(new Error('Coupon not found!'));
    }
    
    if(code){
        if(coupon.code==code.toLowerCase()){
            return next(new Error('Code is the same!'));
        }
        // check if new code is unique
        const updatedCoupon=await CouponModel.findOne({code:code.toLowerCase()});
        if(updatedCoupon){
            return next(new Error('Coupon with the same code already exist!'));
        }
        coupon.code=code.toLowerCase();
        
    }
    if(amount){
        coupon.amount=amount;
    }
    if(fromDate){
        coupon.fromDate=fromDate;
    }
    if(toDate){
        coupon.toDate=toDate;
    }
    // save updated coupon
await coupon.save();
    res.json({message:'Coupon updated successfully', coupon});
    

    
})

// ======================= delete coupon by id ===============================================

export const deleteCoupon=asyncHandler(async(req,res,next)=>{
    const{couponID}=req.params;
    // check if coupon is exist
    const coupon=await CouponModel.findById(couponID);
    if(!coupon){
        return next(new Error('Coupon not found!'));
    }
    // delete the coupon
    await CouponModel.deleteOne(coupon);
    res.status(200).json({message:'Coupon deleted successfully'});

    
}
);