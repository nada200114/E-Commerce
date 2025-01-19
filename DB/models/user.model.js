import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],
        minlength:[3,"Name must be at least 3 characters long"],
        maxlength:[50,"Name must be at most 50 characters long"],
        trim: true        
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        trim:true
    },
    confirmed:{
        type:Boolean,
        default:false
    },
    phone:{
        type:[String]
    },
    address:{
        type:[String]
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"       
    },
    loggedIn:{
    
            type:Boolean,
            default:false
        
    },
    resetPasswordOTP:{
        type:String
    },
    resetPasswordOTPExpires: {
        type: Date
        }

},{
    timestamps:true,
    versionKey: false
})

const userModel=mongoose.model("User",userSchema);

export default userModel;