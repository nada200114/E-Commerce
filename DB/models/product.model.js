import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "A product must have a name"],
        unique: true,
        trim: true,
        minLength: [3, "Name must be at least 3 characters long"],
        maxLength: [50, "Name must not exceed 50 characters long"]
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 255
    },
    description: {
        type: String,
        required: [true, "A product must have a description"],
        trim: true,
        minLength: [10, "Description must be at least 10 characters long"],  
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image: {
        secure_url: String,
        public_id: String,
    },
    coverImages: [{
        secure_url: String,
        public_id: String,
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true
    },
    brand:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true

    },
    customId: {
        type: String
    },
    price:{
        type: Number,
        required: true,
        min: [0, "Price must be greater than or equal to 0"]
    },
    discount:{
        type: Number,
        default: 1,
        min: [1, "Discount must be greater than or equal to 0"],
        max: [100, "Discount must be less than or equal to 100"]
        
    },
    stock: {
        type: Number,
        required: true,
        min: [0, "Stock must be greater than or equal to 0"]
    },
    rateAvg:{
        type: Number,
        default: 0,
        min: [0, "Rate must be greater than or equal to 0"],
        max: [5, "Rate must be less than or equal to 5"] 
    },
    rateNum:{
        type: Number,
        default: 0,
    }
});

const productModel = mongoose.model('product', productSchema);
export default productModel;
