import mongoose from "mongoose";
import { asyncHandler } from "../src/utils/asyncHandler.js";

const connectionDB=asyncHandler(async(req,res,next)=>{
    await mongoose.connect("mongodb://127.0.0.1:27017/ECommerce1");
    console.log("MongoDB connected successfully");
})

export default connectionDB;