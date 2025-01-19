import { response } from "express";
import cartModel from "../../../DB/models/cart.model.js";
import CouponModel from "../../../DB/models/coupon.model.js";
import productModel from "../../../DB/models/product.model.js";
import savedProductsModel from "../../../DB/models/savedProducts.model.js";
import SharedCartModel from "../../../DB/models/sharedCart.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  applyCouponDiscount,
  calculateTotal,
  getOrCreateCart,
  getSavedProducts,
} from "../../utils/cartServices.js";
import { AppError } from "../../utils/classError.js";
import jwt from "jsonwebtoken";

// cart empty ??
// cart has products in their
// product exist ? product in the cart already ? update quantity >>add 1 >> or just add product
// clear cart ,,
// add product >> stock>0 ||
// export const addProduct = asyncHandler(async (req, res, next) => {

//================================ add product to cart ============================================================

export const addProduct = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  // Validate inputs
  if (!productId || !quantity) {
    return next(new AppError("Invalid inputs!", 400));
  }

  // Check if product exists and has stock
  const existingProduct = await productModel.findById(productId);
  if (!existingProduct || existingProduct.stock <= 0) {
    return next(new AppError("Product not found or out of stock!", 404));
  }
  // Check if the quantity being added exceeds available stock
  if (quantity > existingProduct.stock) {
    return next(
      new AppError("Cannot add more than available stock to the cart!", 400)
    );
  }

  // Retrieve or create user's cart
  let cart = await getOrCreateCart(userId);

  // Check if product is already in cart
  const productInCart = cart.products.find(
    (product) => product.productId._id.toString() === productId.toString()
  );

  // If the product is already in the cart, check if we are adding more
  if (productInCart) {
    const newQuantity = productInCart.quantity + quantity;

    // Prevent adding more than available stock to the cart
    if (newQuantity > existingProduct.stock) {
      return next(
        new AppError("Cannot add more than available stock to the cart!", 400)
      );
    }

    // Update the existing product quantity in the cart
    productInCart.quantity = newQuantity;
  } else {
    // If the product is not in the cart, add it
    cart.products.push({ productId, quantity });
  }

  // Save updated cart
  await cart.save();

  // Calculate total cost
  let totalCost = await calculateTotal(userId);

  // Apply coupon if provided
  if (cart.coupon) {
    try {
      const { finalCost, couponId } = await applyCouponDiscount(
        totalCost,
        cart.coupon
      );
      cart.totalCost = finalCost;
      cart.coupon = couponId;
    } catch (error) {
      return next(new AppError("Invalid coupon!", 400));
    }
  } else {
    cart.totalCost = totalCost; // No discount applied
    cart.coupon = null;
  }

  // Save final cart state
  await cart.save();

  res.status(200).json({ message: "Product added successfully", cart });
});

//========================= remove specific product from cart ======================================================
export const removeProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user._id;

  // Validate inputs
  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  // Get or create the user's cart
  let cart = await getOrCreateCart(userId);

  // Find the product index in the cart
  const productIndex = cart.products.findIndex(
    (product) => product.productId._id.toString() === productId.toString()
  );

  if (productIndex === -1) {
    return next(new AppError("Product not found in cart", 404));
  }

  // Remove the product from the cart
  cart.products.splice(productIndex, 1);

  // check if cart became empty
  if (cart.products.length === 0) {
    cart.totalCost = 0;
    cart.coupon = null;
  } else {
    // Recalculate the total cost

    const totalCost = await calculateTotal(userId);

    // If there's a coupon applied, recalculate the cost with the coupon discount
    if (cart.coupon) {
      const { finalCost } = await applyCouponDiscount(totalCost, cart.coupon);
      cart.totalCost = finalCost;
    } else {
      cart.totalCost = totalCost;
    }
  }

  // Save the updated cart
  await cart.save();

  res.status(200).json({
    message: "Product removed successfully",
    cart,
  });
});

//======================== update quantity of product in cart =======================================================
export const updateProductQuantity = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  // Validate inputs
  if (!productId || !Number.isInteger(quantity) || quantity < 0) {
    return next(
      new AppError("Invalid quantity. Please provide a positive integer.", 400)
    );
  }

  // Get or create the user's cart
  let cart = await getOrCreateCart(userId);

  // Find the product index in the cart
  const productIndex = cart.products.findIndex(
    (product) => product.productId._id.toString() === productId.toString()
  );
  if (productIndex === -1) {
    return next(new AppError("Product not found in cart", 404));
  }

  // Check product existence and stock
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new AppError("Product not found in database", 404));
  }
  // product already exists

  if (quantity > product.stock) {
    return next(new AppError("Not enough stock available!", 400));
  }

  if (quantity === 0) {
    // Remove product from cart
    cart.products.splice(productIndex, 1);
  } else {
    //
    // Update product quantity in cart

    cart.products[productIndex].quantity = quantity;
  }

  // Recalculate the total cost
  let totalCost = await calculateTotal(userId);

  // If there's a coupon applied, recalculate the cost with the coupon discount
  if (cart.coupon) {
    const { finalCost } = await applyCouponDiscount(totalCost, cart.coupon);
    cart.totalCost = finalCost;
  } else {
    cart.totalCost = totalCost;
  }

  // Save the updated cart
  await cart.save();

  res
    .status(200)
    .json({ message: "Product quantity updated successfully", cart });
});

//============================ clear cart ============================================================================
export const clearCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  // Get or create the user's cart
  let cart = await getOrCreateCart(userId);
  // Check if the cart is already empty
  if (cart.products.length === 0) {
    return res.status(200).json({ message: "Cart is already empty", cart });
  }
  // Remove all products from the cart
  cart.products = [];
  // reset total price to 0
  cart.totalCost = 0;
  // reset coupon
  cart.coupon = null;
  // Save the updated cart
  await cart.save();
  res.status(200).json({ message: "Cart cleared successfully", cart });
});

// ================================== Apply coupon to cart ===========================================================

export const applyCoupon = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { couponCode } = req.body;
  // Validate inputs
  if (!couponCode) {
    return next(new AppError("Coupon code is required", 400));
  }
  // check if cart exists
  let cart = await getOrCreateCart(userId);
  // check if cart is empty
  if (cart.products.length === 0) {
    return next(
      new AppError("Cart is empty. Please add products to proceed.", 400)
    );
  }
  // calc total cost
  let totalCost = await calculateTotal(userId);

  let { finalCost, couponId, discount } = await applyCouponDiscount(
    totalCost,
    couponCode
  );
  // if coupon is valid, apply the discount and update the cart
  cart.totalCost = finalCost;
  cart.coupon = couponId;
  cart.discount = discount;
  await cart.save();
  res.status(200).json({ message: "Coupon applied successfully", cart });
});

// ============================= Remove coupon from cart ===========================================================

export const removeCoupon = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  // check if cart exists
  let cart = await getOrCreateCart(userId);

  // if there's a coupon applied, remove it and update the cart
  if (cart.coupon) {
    cart.coupon = null;
    cart.discount = 0;
    cart.totalCost = await calculateTotal(userId);
    await cart.save();
  }
  res.status(200).json({ message: "Coupon removed successfully", cart });
});

// ============================= save cart for later ===========================================================

// we click on a specific product on cart
// we check if their is a savedProductFile for the user if not we create one
// if their is a saved products >> we check if product exist their
// exist? update quantity : add product
// save savedProductForLater()
// remove product from cart

// we save the product id in a separate collection named savedProducts

export const saveProductForLater = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  // Validate inputs
  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  // Check if cart exists
  let cart = await getOrCreateCart(userId);

  // Check if cart is empty
  if (cart.products.length === 0) {
    return next(
      new AppError("Cart is empty. Please add products to proceed.", 400)
    );
  }

  // Check if product exists in cart
  let productInCartIndex = cart.products.findIndex((product) => {
    return product.productId._id.toString() === productId.toString();
  });

  if (productInCartIndex === -1) {
    return next(new AppError("Product not found in cart", 404));
  }

  // Get product quantity from cart
  const quantity = cart.products[productInCartIndex].quantity;

  // Check if Saved Products for user exist or create one
  let savedProducts = await savedProductsModel.findOne({ user: userId });
  if (!savedProducts) {
    savedProducts = await savedProductsModel.create({
      user: userId,
      products: [],
    });
  }

  // Check if product exists in saved products
  let productInSavedProductsIndex = savedProducts.products.findIndex(
    (product) => {
      return product.productId._id.toString() === productId.toString();
    }
  );

  if (productInSavedProductsIndex === -1) {
    // Product does not exist, add it to saved products
    savedProducts.products.push({
      productId,
      quantity,
    });
  } else {
    // Product exists in saved products, update quantity
    savedProducts.products[productInSavedProductsIndex].quantity += quantity;
  }

  await savedProducts.save();

  // Remove product from cart
  cart.products.splice(productInCartIndex, 1);

  // If cart is empty, reset totalCost and coupon
  if (cart.products.length === 0) {
    cart.totalCost = 0;
    cart.coupon = null;
  }

  // Recalculate total cost
  cart.totalCost = await calculateTotal(userId);

  if (cart.coupon) {
    const { finalCost, couponId, discount } = await applyCouponDiscount(
      cart.totalCost,
      cart.coupon
    );
    cart.totalCost = finalCost;
    cart.coupon = couponId;
    cart.discount = discount;
  }

  await cart.save();

  res.status(200).json({
    message: "Product saved for later successfully",
    savedProducts,
    cart,
  });
});

// ============================= Retrieve saved product to cart ===================================================

export const retrieveSavedProduct = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  // Validate inputs
  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }
  // Check if Saved Products for user exist
  let savedProducts = await getSavedProducts(userId);
  if (savedProducts.products.length === 0) {
    return next(new AppError("No saved products found for this user", 404));
  }
  // Check if product exists in saved products
  let productInSavedProductsIndex = savedProducts.products.findIndex(
    (product) => {
      return product.productId._id.toString() === productId.toString();
    }
  );

  if (productInSavedProductsIndex === -1) {
    return next(new AppError("Product not found in saved products", 404));
  }
  // check if product exists in cart
  let cart = await getOrCreateCart(userId);
  let productInCartIndex = cart.products.findIndex((product) => {
    return product.productId._id.toString() === productId.toString();
  });
  if (productInCartIndex === -1) {
    // Product does not exist in cart, add it to cart then add it to cart
    const { quantity } = savedProducts.products[productInSavedProductsIndex];
    cart.products.push({ productId, quantity });
  }
  // Recalculate total cost
  cart.totalCost = await calculateTotal(userId);
  if (cart.coupon) {
    const { finalCost, couponId, discount } = await applyCouponDiscount(
      cart.totalCost,
      cart.coupon
    );
    cart.totalCost = finalCost;
    cart.coupon = couponId;
    cart.discount = discount;
  } else {
    cart.totalCost = await calculateTotal(userId);
  }

  await cart.save();
  // Remove product from saved products
  savedProducts.products.splice(productInSavedProductsIndex, 1);
  await savedProducts.save();
  res.status(200).json({
    message: "Product retrieved and added to cart successfully",
    cart,
  });
});

// ============================= Remove saved product  =============================================================
export const removeSavedProduct = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;
  // Validate inputs
  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }
  // check if saved product exists
  let savedProducts = await getSavedProducts(userId);
  if (savedProducts.products.length === 0) {
    return next(new AppError("No saved products found for this user", 404));
  }
  const savedProductsIndex = savedProducts.products.findIndex((product) => {
    return product.productId._id.toString() === productId.toString();
  });
  if (savedProductsIndex === -1) {
    return next(new AppError("Product not found in saved products", 404));
  }
  // Remove product from saved products
  savedProducts.products.splice(savedProductsIndex, 1);
  await savedProducts.save();
  res.status(200).json({
    message: "Product removed from saved products successfully",
    savedProducts,
  });
});

// ============================= Get saved products  =============================================================
export const getAllSavedProducts = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  let savedProducts = await getSavedProducts(userId);
  if (!savedProducts) {
    return next(new AppError("No saved products found for this user", 404));
  }
  res.status(200).json(savedProducts);
});

// ============================= Save the entire cart products for later ============================================
export const saveProducts = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  // check if cart exist
  const cart = await getOrCreateCart(userId);
  if (cart.products.length === 0) {
    return next(
      new AppError("Cart is empty. Please add products to proceed.", 400)
    );
  }
  // check if savedProducts for user exist or create
  let savedProductsList = await getSavedProducts(userId);
  // map on cart products to save it
  for (const product of cart.products) {
    // check for the product stock
    let originalProduct = await productModel.findById(product.productId._id);
    if (!originalProduct || originalProduct.quantity < product.quantity) {
      return next(new AppError("Product out of stock", 400));
    }

    // check if product already exist in saved products
    const savedProductIndex = savedProductsList.products.findIndex(
      (savedProduct) => {
        return (
          savedProduct.productId._id.toString() ===
          product.productId._id.toString()
        );
      }
    );
    if (savedProductIndex === -1) {
      // product does not exist in saved products, add it to saved products
      savedProductsList.products.push({
        productId: product.productId._id,
        quantity: product.quantity,
      });
    } else {
      // product exists in saved products, update quantity
      let newQuantity =
        savedProductsList.products[savedProductIndex].quantity +
        product.quantity;
      if (newQuantity > originalProduct.quantity) {
        return next(new AppError("Product out of stock", 400));
      }
      savedProductsList.products[savedProductIndex].quantity = newQuantity;
    }
  }
  await savedProductsList.save();

  // remove all products from cart
  cart.products = [];
  cart.totalCost = 0;
  cart.coupon = null;

  await cart.save();
  res.status(200).json({
    message: "Products saved for later successfully",
    savedProductsList,
  });
});

// =============================Retrieve all saved products to cart =====================================================
export const retrieveProducts = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  //check for saved products list
  let savedProductsList = await getSavedProducts(userId);
  if (savedProductsList.products.length === 0) {
    return next(new AppError("No saved products found for this user", 404));
  }
  // check if cart exist
  let cart = await getOrCreateCart(userId);
  // map on saved products to add them to cart
  // get original product to check on its quantity later
  for (const product of savedProductsList.products) {
    let originalProduct = await productModel.findById(product.productId._id);
    if (!originalProduct || originalProduct.quantity < product.quantity) {
      return next(new AppError("Product out of stock", 400));
    }
    // check if product already exists in cart
    let cartProductIndex = cart.products.findIndex((cartProduct) => {
      return (
        cartProduct.productId._id.toString() ===
        product.productId._id.toString()
      );
    });
    if (cartProductIndex === -1) {
      // product does not exist in cart, add it to cart
      cart.products.push({
        productId: product.productId._id,
        quantity: product.quantity,
      });
    } else {
      // exist
      let newQuantity =
        cart.products[cartProductIndex].quantity + product.quantity;
      if (newQuantity > originalProduct.quantity) {
        return next(new AppError("Product out of stock", 400));
      }
      cart.products[cartProductIndex].quantity = newQuantity;
    }
  }
  // clear saved products list
  savedProductsList.products = [];
  // calculate total cost
  cart.totalCost = await calculateTotal(userId);
  if (cart.coupon) {
    const { finalCost, couponId, discount } = await applyCouponDiscount(
      cart.totalCost,
      cart.coupon
    );
    cart.totalCost = finalCost;
    cart.coupon = couponId;
    cart.discount = discount;
  }

  await savedProductsList.save();

  await cart.save();
  res.status(200).json({
    message: "Products retrieved and added to cart successfully",
    cart,
  });
});

// ============================= clear saved products list ============================================================
// export const clearProductsList=asyncHandler(async(req,res,next)=>{
//   const userId = req.user._id;
//   // check if there are any saved products
//   let savedProductsList = await getSavedProducts(userId);
//   if(savedProductsList.products.length===0){
//     return next(new AppError("No saved products found for this user", 404));
//   }
//   // clear saved products list
//   savedProductsList.products = [];
//   await savedProductsList.save();
//   res.status(200).json({message:"Saved products list cleared successfully"});

// });

export const clearProductsList = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Retrieve saved products list for the user
  let savedProductsList = await getSavedProducts(userId);

  // Check if the list has any products
  if (!savedProductsList || savedProductsList.products.length === 0) {
    return next(new AppError("No saved products found for this user", 404));
  }

  // Clear the saved products list
  savedProductsList.products = [];
  await savedProductsList.save();

  // Send response
  res.status(200).json({
    message: "Saved products list cleared successfully",
    savedProductsList, // Optionally include the cleared list
  });
});

// ======================== share cart ======================================================

export const generateSharedCartLink = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  // check if cart exist
  let cart = await getOrCreateCart(userId);
  // check if cart is  empty
  if (cart.products.length === 0) {
    return next(
      new AppError("Cart is empty. Please add products to proceed.", 400)
    );
  }
  // generate a unique link
  const token = jwt.sign({ userId }, process.env.sharedCartToken, {
    expiresIn: "1d",
  });
  const sharedCartLink = `${req.protocol}://${req.headers.host}/carts/shared-cart/${token}`;

  // create shared cart
  const sharedCart = await SharedCartModel.create({
    userId,
    token,
    products: cart.products,
    totalCost: cart.totalCost,
  });

  res.status(200).json({
    message: "Shared cart link generated successfully",
    sharedCartLink,
    sharedCart,
  });
});

// ======================= get shared cart =======================

export const getSharedCart = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  // verify the token
  const { userId } = jwt.verify(token, process.env.sharedCartToken);
  // get shared cart
  const sharedCart = await SharedCartModel.findOne({ token, userId }).populate(
    "products.productId"
  );
  if (!sharedCart) {
    return next(new AppError("Invalid shared cart link", 401));
  }
  // update cart

  res.status(200).json({ message: "Success", sharedCart });
});

// ====================== get cart ====================================

export const getCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  // check if cart exist
  let cart = await getOrCreateCart(userId);
  // check if cart is  empty
  if (cart.products.length === 0) {
    return next(
      new AppError("Cart is empty. Please add products to proceed.", 400)
    );
  }
  // calculate total cost
  cart.totalCost = await calculateTotal(userId);
  if (cart.coupon) {
    const { finalCost, couponId, discount } = await applyCouponDiscount(
      cart.totalCost,
      cart.coupon
    );
    cart.totalCost = finalCost;
    cart.coupon = couponId;
  }
  res.status(200).json({
    message: "Cart retrieved successfully",
    cart,
  });
});
