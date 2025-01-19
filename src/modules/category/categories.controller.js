import { nanoid } from "nanoid";
import categoryModel from "../../../DB/models/category.model.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import subCategoryModel from "../../../DB/models/cubCategory.model.js";

//============================================================================================

// APIs I created are :
// POST createCategory >> it creates a new category
// GET getAllCategories >> it gets all categories without subcategories
// GET getCategoryByID >> it gets category by ID without subcategories
// GET getAllCategoriesInfo >> it gets all categories with subcategories
// GET categoryAndSubcategory >> it gets category by ID with its subcategories
// PUT updateCategory >> it updates category info by ID
// DELETE deleteCategory >> it deletes category by ID

//================================ create category categories ================================
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  // check if category is already exist

  const categoryExist = await categoryModel.findOne({
    name: name.toLowerCase(),
  });
  if (categoryExist) {
    return next(new AppError("Category already exist !"));
  }

  if (!req.file) {
    return next(new AppError("File not found , Please upload an image."));
  }

  const customId = nanoid(5);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `Ecommerce1/categories/${customId}`,
    }
  );
  const category = await categoryModel.create({
    name,
    customId,
    slug: slugify(name, { replacement: "-" }),
    createdBy: req.user._id,
    image: { secure_url, public_id },
  });

  res.status(201).json({ message: "Category created successfully", category });
});

// ================================== Get all categories =====================================
export const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await categoryModel.find().sort({ createdAt: -1 });
  if (!categories) {
    return next(new AppError("No categories found!"));
  }
  res
    .status(200)
    .json({ message: "Categories fetched successfully", categories });
});

// ====================================== Get single category by ID ==========================
export const getCategoryByID = asyncHandler(async (req, res, next) => {
  const { categoryID } = req.params;

  const category = await categoryModel.findById(categoryID);

  // check if category is existing
  if (!category) {
    return next(new AppError("Category not found!"));
  }
  res.status(200).json({ message: "Category fetched successfully", category });
});

// ====================================== Update single category by ID =======================
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { categoryID } = req.params;
  const { name } = req.body;

  // check if category is exist
  const category = await categoryModel.findById(categoryID);

  if (!category) {
    return next(new AppError("Category not found!"));
  }

  // check if category name is the same for the exact category ***
  if (category.name === name.toLowerCase()) {
    return next(new AppError("Category name is the same!"));
  }

  // check if category is already exist
  const categoryExist = await categoryModel.findOne({
    name: name.toLowerCase(),
  });
  if (categoryExist) {
    return next(new AppError("Category already exist!"));
  }

  // update category

  category.name = name;
  category.slug = slugify(name, { replacement: "-" });
  // check if category image is updated
  if (req.file) {
    // first we need to delete 'destroy the exist image from cloudinary'
    await cloudinary.uploader.destroy(category.image.public_id);
    // then we need to uploa the updated image
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `Ecommerce1/categories/${category.customId}` }
    ); // we need to specify the same folder of category ^^^
  }

  // then we need to save the updated category
  await category.save();
  res.status(200).json({ message: "Category updated successfully", category });
});

// ====================================== Delete single category by ID =======================

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { categoryID } = req.params;

  // check if category is existing
  const category = await categoryModel.findById(categoryID);
  if (!category) {
    return next(new AppError("Category not found!"));
  }
  // check if category has subcategories
  const subcategories=await subCategoryModel.find({category:categoryID});
  // delete subcategories
  if(subcategories.length > 0){
    await subCategoryModel.deleteMany(subcategories);

  }
  // first we need to delete 'destroy the exist image from cloudinary'
  await cloudinary.uploader.destroy(category.image.public_id);
  // then we need to delete the category
  await categoryModel.deleteOne({_id:category});

  res.status(200).json({ message: "Category deleted successfully" });

  // remeber we need to add subcategory section ,later //
});

// ===================================== Get All categories with subcategories ===============
export const getAllCategoriesInfo = asyncHandler(async(req,res,next)=>{
  const categories =await categoryModel.find({}).populate('subCategories','-createdBy');
  if(categories.length===0)return next(new AppError('No categories were found !'))
    res.status(200).json({message:'All categories with subcategories fetched successfully!!',categories})
  
})

//==================================== Get single category with subcategories by ID ==========
export const categoryAndSubcategory= asyncHandler(async(req,res,next)=>{
  const {categoryID}=req.params;
  const category=await categoryModel.findById(categoryID).populate('subCategories','-createdBy');
  if(!category) return next(new AppError('Category not found!'));
  res.status(200).json({message:'Category with subcategories fetched successfully!!',category});
});