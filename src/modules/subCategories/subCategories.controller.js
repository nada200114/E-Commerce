import { nanoid } from "nanoid";
import categoryModel from "../../../DB/models/category.model.js";
import subCategoryModel from "../../../DB/models/cubCategory.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloudinary.js";
import { AppError } from "../../utils/classError.js";
import mongoose from "mongoose";
import slugify from "slugify";
//  ==========================================================================================
// APIs I created are :
// POST createSubcategory >> it creates a new subcategory
// GET getSubCategories >> it gets all subcategories without categories
// GET getSubcategory >> it gets getSubcategory by ID without categories
// GET allSubcategoriesWithCategories >> it gets all subcategories with categories
// GET getSubcategoryWithCategory >> it gets subcategory by ID with its category
// PUT updateSubcategory >> it updates updateSubcategory info by ID
// DELETE deleteSubcategory >> it deletes subcategory by ID

// ========================== Get all subcategories ==========================================
export const getSubCategories = asyncHandler(async (req, res, next) => {
  const { categoryID } = req.params;

  const subcategories = await subCategoryModel.find({category: categoryID});
  if (subcategories.length === 0) {
    return next(new Error("No subcategories found"));
  }
  res
    .status(200)
    .json({ message: "Subcategories fetched successfully !!", subcategories });
});
// ========================== Get all subcategories based on category ========================
export const getAllSubCategories = asyncHandler(async (req, res, next) => {
  const subcategories = await subCategoryModel.find({});
  console.log(req.params)
  if (subcategories.length === 0) {
    return next(new Error("No subcategories found"));
  }
  res
    .status(200)
    .json({ message: "Subcategories fetched successfully !!", subcategories });
});
// ========================== Get subcategory by id ==========================================
export const getSubcategory = asyncHandler(async (req, res, next) => {
  const { subCategoryID } = req.params;
  // check if subcategory is exist
  const subcategory = await subCategoryModel.findById(subCategoryID);
  if (!subcategory) {
    return next(new Error("Subcategory not found"));
  }
  res
    .status(200)
    .json({ message: "Subcategory fetched successfully !!", subcategory });
});

// ============================== Create Subcategories =======================================
export const createSubcategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { categoryID } = req.params;


  // check ig category is exist
  const categoryExist = await categoryModel.findById(categoryID);
  if (!categoryExist) {
    return next(new AppError("Category not found"));
  }
  // check if subCategory is exist //in the same category // i think it maybe there is the the sub cat in different categories
  const subCategoryExist = await subCategoryModel.findOne({
    name: name.toLowerCase(),
    category: categoryID,
  });
  if (subCategoryExist) {
    return next(new AppError("Subcategory already exist"));
  }
  if (!req.file) {
    return next(new AppError("File not found, Please upload an image."));
  }
  //first we need to upload the image to cloudinary
  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Ecommerce1/categories/${categoryExist.customId}/subcategories/${customId}`,
    }
  );

  // creat subcategory
  const subcategory = await subCategoryModel.create({
    name,
    customId,
    slug: slugify(name, { replacement: "-" }),
    category: categoryID,
    image: { secure_url, public_id },
    createdBy: req.user._id,
  });
  res
    .status(201)
    .json({ message: "Subcategory created successfully!!", subcategory });
});

// ===================================== update subcategory ==================================
export const updateSubcategory = asyncHandler(async (req, res, next) => {
  const { subCategoryID } = req.params;
  const { name } = req.body;

  // check if subcategory is exist bu id"
  const subCategory = await subCategoryModel.findById(subCategoryID);
  if (!subCategory) return next(new Error("Subcategory not found"));

  if (!name && !req.file) return next(new Error("No changes provided"));

  // check if subcategory name is updated
  if (name) {
    if (subCategory.name === name.toLowerCase()) {
      return next(new Error("Subcategory name is not updated"));
    } // the following do 2 in 1 it checks for the exact subcategory name and for the other subcategories in the same category

    // check if updated name of subcategory is exist in the same category // i think it maybe there is the the sub cat in different categories
    const subCategoryExist = await subCategoryModel.findOne({
      name: name.toLowerCase(),
      category: subCategory.category,
    });
    if (subCategoryExist && subCategoryExist._id.toString() !== subCategoryID) {
      return next(new Error("Subcategory already exist in the same category"));
    }

    subCategory.name = name;
    subCategory.slug = slugify(name, { replacement: "-" });
  }

  // check if image updated
  if (req.file) {
    // first we need to delete 'destroy the exist image from cloudinary'
    await cloudinary.uploader.destroy(subCategory.image.public_id);
    // then we need to uploa the updated image
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `Ecommerce1/categories/${subCategory.category.customId}/subcategories/${subCategory.customId}`,
      }
    );
    // update subcategory image
    subCategory.image = { secure_url, public_id };
  }
  // update subcategory

  await subCategory.save();
});

// ===================================== Delete Subcategory ===================================
export const deleteSubcategory = asyncHandler(async (req, res, next) => {
  const { subCategoryID } = req.params;
  // check if subcategory is exist
  const subcategory = await subCategoryModel.findById(subCategoryID);
  if (!subcategory) {
    return next(new Error("Subcategory not found"));
  }
  // first we need to delete image from cloudinary
  await cloudinary.uploader.destroy(subCategory.image.public_id);
  // then we need to delete the subcategory
  await subCategoryModel.deleteOne(subcategory);
  res.status(200).json({ message: "Subcategory deleted successfully" });
});

// ======================= Get all subcategories info including categories ===================
export const allSubcategoriesWithCategories=asyncHandler(async(req,res,next)=>{
  const subcategories=await subCategoryModel.find({}).populate("category","-createdBy");
  if(subcategories.length===0)return next(new AppError("No subcategories found !"));
  res.status(200).json({message:"Subcategories fetched successfully!!",subcategories});
 
})

// ============================ Get subcategories by ID with its category ====================

export const getSubcategoryWithCategory=asyncHandler(async(req,res,next)=>{
  const {subcategoryID}=req.params;
  const subcategory=await subCategoryModel.findById(subcategoryID).populate("category","-createdBy");
  if(!subcategory)return next(new AppError("No subcategory found !"));
  res.status(200).json({message:"Subcategory fetched successfully!!",subcategory});
});

  