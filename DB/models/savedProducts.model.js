import mongoose from "mongoose";


const savedProductsSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true 
    },
    products:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"product",
                required:true  
            },
            quantity:{
                type:Number,
                required:true,
                default:1,
                min:1                
            },
            savedAt:{
                type:Date,
                default:Date.now()
            }


        }
    ],
  
    

});

const savedProductsModel=mongoose.model('SavedForLaterProducts',savedProductsSchema);

export default savedProductsModel;