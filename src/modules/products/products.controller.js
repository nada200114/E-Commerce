import { nanoid } from "nanoid";
import brandModel from "../../../DB/models/barand.model.js";
import categoryModel from "../../../DB/models/category.model.js";
import subCategoryModel from "../../../DB/models/cubCategory.model.js";
import productModel from "../../../DB/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";

// ===========================================================================================
// Create 
// Get All
// Get single 
// Update
// Delete
// ===========================================================================================

// ========================= Get All products ================================================

export const getProducts = asyncHandler(async (req, res, next) => {
  const products = await productModel.find({});
  if (products.length === 0) return next(new AppError("No products found !"));
  res
    .status(200)
    .json({ message: "All products fetched successfully!!", products });
});

// ========================= Get single product by ID ========================================

export const getProductById = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  // check if product exists
  const product = await productModel.findById(productId);
  if (!product) return next(new AppError("Product not found."));
  res.status(200).json({ message: "Product fetched successfully!!", product });
});

// ========================= create new product ==============================================

export const createProduct = asyncHandler(async (req, res, next) => {
  const {
    title,
    price,
    discount,
    stock,
    description,
    category,
    subcategory,
    brand,
  } = req.body;
  // check if product already exist
  const productExist = await productModel.findOne({
    title: title.toLowerCase(),
  });
  if (productExist) return next(new AppError("Product already exist."));

  // check if category already exist
  const categoryExist = await categoryModel.findById(category);
  if (!categoryExist) return next(new AppError("category not exist."));

  // check if subcategory already exist and it it in the same category
  const subcategoryExist = await subCategoryModel.findOne({
    _id: subcategory,
    category,
  });
  if (!subcategoryExist) return next(new AppError("subcategory not exist."));

  // check if brand already exist
  const brandExist = await brandModel.findById(brand);
  if (!brandExist) return next(new AppError("brand not exist."));

  // check if discount applied
  const finalPrice = discount ? price - price * (discount / 100) : price;

  if (!req.files) return next(new AppError("Files is required"));

  const customId = nanoid(5);
  //  categories >> subcategories >> products >>
  // categories >> category 1 >> subcategories>> subcategory 1>> products>> product1
  const imageFolder=`Ecommerce1/categories/${categoryExist.customId}/subcategories/${subcategoryExist.customId}/products/${customId}/productImage`
  const folder = `Ecommerce1/categories/${categoryExist.customId}/subcategories/${subcategoryExist.customId}/products/${customId}/coverImages`;

  //  we need to upload coverImages >> loop over covers
  // Array if objects
  const list = [];
  for (const file of req.files.coverImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder }
    );
    list.push({ secure_url, public_id });
  }
  // upload image
  const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.image[0].path,{folder:imageFolder});


  const product = await productModel.create({
    title,
    slug: slugify(title, { replacement: "-" }),
    price: finalPrice,
    discount,
    stock,
    description,
    category: categoryExist._id,
    subcategory: subcategoryExist._id,
    brand: brandExist._id,
    image: { secure_url, public_id },
    coverImages: list,
    createdBy: req.user._id,
    customId,
  });
  res.status(201).json({ message: "Product created successfully!!", product });
});

// ========================= Update single product by ID =====================================

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const {
    title,
    price,
    discount,
    stock,
    description,
    category,
    subcategory,
    brand,
  } = req.body;
  // check if product exists
  const product = await productModel.findOne({
    _id: productId,
    createdBy: req.user._id,
  });
  if (!product) return next(new AppError("Product not found."));
  if (category) {
    // check if category  exist
    const categoryExist = await categoryModel.findById(category);
    if (!categoryExist) return next(new AppError("category not exist."));
    product.category = categoryExist._id;
  }

  if (subcategory) {
    // check if subcategory  exist
     const subcategoryExist = await subCategoryModel.findOne({
      _id: subcategory,
      category,
    });
    if (!subcategoryExist) return next(new AppError("subcategory not exist."));
    product.subcategory = subcategoryExist._id;
  }
  if (brand) {
    const brand = await brandModel.findOne({ _id: brand });
    if (!brand) return next(new AppError("brand not exist."));
    product.brand = brand._id;
  }

  if (title) {
    // check if title updated
    if (product.title === title.toLowerCase())
      return next(new AppError("Title is the same."));
    // check if title is unique in the subcategory
    const updatedTitle = await productModel.findOne({
      title: title.toLowerCase(),
      subcategory,
    });
    if (updatedTitle)
      return next(new AppError("Product with the same title already exist."));
    product.title = title;
    product.slug = slugify(title, { replacement: "-" });
  }

// option 1 : discount updated >>  price updated or price not updated 
// option 2 : discount not updated &&price updated >>  product.discount has already a value ? 
if(discount!==undefined){
    product.discount=discount;
    // product.price = price - price * (discount / 100);
  if(price!==undefined){
    product.price = price - (price * (discount / 100));
  }else{
    product.price = product.price - (product.price * (discount / 100))  }
}else if(price!==undefined&&product.discount!==undefined){
    product.price = price-(price*(product.discount / 100));

}
  if (stock) {
    product.stock = stock;
  }

  if (description) {
    product.description = description;
  }

  // upload image
  if (req.files) {
    const customId = nanoid(5);
    const existingCategory =await categoryModel.findById(product.category);
    const existingSubcategory = await subCategoryModel.findById(product.subcategory);
    const imageFolder=`Ecommerce1/categories/${existingCategory.customId}/subcategories/${existingCategory.customId}/products/${customId}/productImage`
    const folder = `Ecommerce1/categories/${existingCategory.customId}/subcategories/${existingCategory.customId}/products/${customId}/coverImages`;
  
    if (req.files.image) {
      if (product.image && product.image.public_id) {
        await cloudinary.uploader.destroy(product.image.public_id);
      }
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.image[0].path,
        { folder:imageFolder }
      );
      product.image = { secure_url, public_id };
    }

    if (req.files.coverImages) {
      const list = [];

      // Delete old files
      for (const file of product.coverImages) {
        await cloudinary.uploader.destroy(file.public_id);
      }
      //  we need to upload coverImages >> loop over covers
      // Array if objects

      for (const file of req.files.coverImages) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          { folder }
        );
        list.push({secure_url, public_id})
      }
      product.coverImages= list;
    }
  }

  await product.save();
  res.status(200).json({ message: "Product updated successfully!!", product });
});

// ========================= Delete single product by ID =====================================
export const deleteProduct=asyncHandler(async(req,res,next)=>{
  const { productId } = req.params;
  // check if product exists
  const product = await productModel.findOne({_id:productId,createdBy:req.user._id});
  if(!product) return next(new AppError("Product not found !",404));
  // delete images from cloudinary
  await cloudinary.uploader.destroy(product.image.public_id);
  for (const file of product.coverImages) {
    await cloudinary.uploader.destroy(file.public_id);
  }
  // delete product from database
  await productModel.deleteOne(product);
   res.status(204).json({ message: "Product deleted successfully!!" });

})
