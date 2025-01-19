import mongoose from "mongoose";

const brandSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"A category must have a name"],
        unique:true,
        trim:true,
        lowercase:true,
        minLength:[3,"Name must be at least 3 characters long"],
        maxLength:[50,"Name must not exceed 50 characters long"]  
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minLength:3,
        maxLength:255   
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    image:{
        secure_url:String,
        public_id:String,
        
    },
    customId:{
        type:String,   
    }
})

const brandModel=mongoose.model('Brand',brandSchema);
export default brandModel;