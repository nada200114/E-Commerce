import cartModel from "../../DB/models/cart.model.js";
import productModel from "../../DB/models/product.model.js";
import CouponModel from "../../DB/models/coupon.model.js";
import { AppError } from "./classError.js";
import mongoose from "mongoose";
import savedProductsModel from "../../DB/models/savedProducts.model.js";

// Get or create a cart for a user
export const getOrCreateCart = async (userID) => {
  if (!userID) throw new AppError("User ID is required", 400);

  let cart = await cartModel
    .findOne({ user: userID })
    .populate('products.productId', 'price title');

  if (!cart) {
    cart = await cartModel.create({ user: userID, products: [] });
  }
  return cart;
};

// Calculate the total cost of products in the cart
export const calculateTotal = async (userId) => {
  if (!userId) throw new AppError("User ID is required", 400);

  const cart = await cartModel.findOne({ user: userId }).populate("products.productId", "price title");

  if (!cart || !Array.isArray(cart.products)) {
    throw new AppError("Cart is empty or not found", 404);
  }

  const totalCost = cart.products.reduce((sum, product) => {
    if (!product.productId || typeof product.productId.price !== "number") {
      console.error("Invalid product or price:", product);
      throw new AppError("Invalid product price in cart", 400);
    }

    const quantity = Number(product.quantity) || 0;
    return sum + (product.productId.price * quantity);
  }, 0);

  return totalCost;
};

// Apply a coupon discount to the total cost
// export const applyCouponDiscount = async (total, coupon) => {
//   if (!coupon) throw new AppError("Coupon code is required", 400);

//   const couponDoc = await CouponModel.findOne({ code: coupon })||await CouponModel.findById(coupon);

//   if (!couponDoc || !couponDoc.amount || typeof couponDoc.amount !== "number" || isNaN(couponDoc.amount)) {
//     throw new AppError("Invalid coupon or coupon amount", 400);
//   }

//   const currentDate = new Date();
//   if (couponDoc.fromDate > currentDate || couponDoc.toDate < currentDate) {
//     throw new AppError("Coupon is expired or not yet valid", 400);
//   }

//   const discount = total * (couponDoc.amount / 100);
//   const finalCost = total - discount // Ensure total is not negative

//   return { finalCost, couponId: couponDoc._id, discount };
// };

export const applyCouponDiscount = async (total, coupon) => {
  if (!coupon) throw new AppError("Coupon code is required", 400);

  let couponDoc;

  // First, try finding by coupon code (string)
  couponDoc = await CouponModel.findOne({ code: coupon })||await CouponModel.findById(coupon);



  // If still no coupon is found, throw error
  if (!couponDoc || !couponDoc.amount || typeof couponDoc.amount !== "number" || isNaN(couponDoc.amount)) {
    throw new AppError("Invalid coupon or coupon amount", 400);
  }

  const currentDate = new Date();
  if (couponDoc.fromDate > currentDate || couponDoc.toDate < currentDate) {
    throw new AppError("Coupon is expired or not yet valid", 400);
  }

  const discount = total * (couponDoc.amount / 100);
  const finalCost = total - discount; // Ensure total is not negative

  return { finalCost, couponId: couponDoc._id, discount };
};



// get or create saved products list

export const getSavedProducts = async (userId) => {
  if (!userId) throw new AppError("User ID is required", 400);
  let savedProducts = await savedProductsModel.findOne({ user: userId }).populate("products.productId", "price title");
  if(!savedProducts){
    // create file
    await savedProducts.create({user:userId,products:[]});

  }

  return savedProducts;

  
    
}

