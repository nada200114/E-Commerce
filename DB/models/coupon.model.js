import mongoose, { Mongoose } from "mongoose";

const couponSchema=new mongoose.Schema({
    code:{
        type:String,
        required:[true,"Name is required"],
        unique:true,
        minlength:[3,"Name must be at least 3 characters long"],
        maxlength:[30,"Name must be at most 30 characters long"],
        trim: true,
        lowercase:true

    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    amount:{
        type:Number,
        required:true,
        min:1,
        max:100
        
    } ,
    usedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",

    },
    customId:String,
    fromDate:{
        type:Date,
        required:true
    },
    toDate:{
        type:Date,
        required:true
    }
},{
    timestamps:true,
    versionKey:false
})

const CouponModel =mongoose.model('Coupon',couponSchema)
export default CouponModel;

