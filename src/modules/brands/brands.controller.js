import slugify from "slugify";
import brandModel from "../../../DB/models/barand.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import cloudinary from "../../utils/cloudinary.js";
import { nanoid } from "nanoid";
//======================== create brand ======================================================
export const createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const brand = await brandModel.findOne({ name: name.toLowerCase() });
  if (brand) return next(new AppError( "Brand already exists" ));

  // check if brand name is unique
  if (!name) return next(new AppError("Name must be provided "));
  
  // check if file uploaded


  if (!req.file) return next(new AppError("No file uploaded"));
  // we need tp upload the file to cloudinary
  const customId = nanoid(5);
  const folder = `Ecommerce1/brands/${customId}`;
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: folder }
  );

  const newBrand = await brandModel.create({
    name,
    slug: slugify(name, { replacement: "-" }),
    customId,
    createdBy: req.user._id,
    image: { secure_url, public_id },
  });
  res
    .status(201)
    .json({ message: "Brand created successfully", brand: newBrand });
});

// ================================ Get all ==================================================
export const getAllBrands=asyncHandler(async(req,res,next)=>{
  const brands=await brandModel.find({});
  if(brands.length===0) return next(new Error("No brands found"));
  res.status(200).json({message:"Brands fetched successfully!!",brands});
})

// ========================= Get single brand by ID ==========================================
export const getBrandByID=asyncHandler(async(req  ,res,next)=>{
  const {brandID}=req.params;
  const brand=await brandModel.findById(brandID);
  if(!brand) return next(new Error("Brand not found"));
  res.status(200).json({message:"Brand fetched successfully",brand})
})

// ========================= Update single brand by ID =======================================
export const updateBrandByID=asyncHandler(async(req,res,next)=>{
  const{brandID}=req.params;
  const {name}=req.body;
  // check if brand is exist
  const brand=await brandModel.findById(brandID);
  if(!brand) return next(new Error("Brand not found"));
  
 if(name){  
  // check if name updated                                              
  if(brand.name===name.toLowerCase()) return next(new Error("Name is the same"));
  // check if new name is unique
  const updatedName=await brandModel.findOne({name:name.toLowerCase()});
  if(updatedName) return next(new Error("brand is already exist !"));

 }
 if(req.file){
  // delete old image 
  await cloudinary.uploader.destroy(brand.image.public_id);
  // upload new image 
  const folder = `Ecommerce1/brands/${brand.customId}`;
 const{secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:folder})
  
  brand.image={secure_url,public_id};
 }
brand.name=name;
 await brand.save();
})

// ========================= Delete single brand by ID =========================================
export const deleteBrand=asyncHandler(async(req,res,next)=>{
  const{brandID}=req.params;
  // check if brand is exist
  const brand=await brandModel.findById(brandID);
  if(!brand) return next(new Error("Brand not found"));
  // delete image from cloudinary
  await cloudinary.uploader.destroy(brand.image.public_id);
  // then we need to delete the brand
  await brandModel.deleteOne({_id:brand});
  res.status(200).json({message:"Brand deleted successfully"});

})





