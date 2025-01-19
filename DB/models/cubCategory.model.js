import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A subcategory must have a name"],
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image: {
        secure_url: String,
        public_id: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    customId: {
        type: String
    }
});

const subCategoryModel = mongoose.model('subCategory', subCategorySchema);
export default subCategoryModel;
