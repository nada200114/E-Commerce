import { Router } from "express";

import * as cartControllers from './cart.controller.js';
import auth from "../../middleware/authentication.js";
import authorizeRole from "../../middleware/authorizedRole.js";

const CartRouter=Router();

CartRouter.post('/',auth(),authorizeRole('user',"admin"),cartControllers.addProduct);
CartRouter.post('/remove',auth(),authorizeRole('user',"admin"),cartControllers.removeProduct);
CartRouter.patch('/product-quantity',auth(),authorizeRole('user',"admin"),cartControllers.updateProductQuantity);
CartRouter.delete('/clear',auth(),authorizeRole('user',"admin"),cartControllers.clearCart);
CartRouter.post('/apply-coupon',auth(),authorizeRole('user',"admin"),cartControllers.applyCoupon);
CartRouter.delete('/remove-coupon',auth(),authorizeRole('user',"admin"),cartControllers.removeCoupon);
CartRouter.post('/save-product',auth(),authorizeRole('user',"admin"),cartControllers.saveProductForLater);
CartRouter.post('/retrieve-saved-product',auth(),authorizeRole('user',"admin"),cartControllers.retrieveSavedProduct);
CartRouter.get('/saved-products',auth(),authorizeRole('user',"admin"),cartControllers.getAllSavedProducts);
CartRouter.post('/save-cart',auth(),authorizeRole('user',"admin"),cartControllers.saveProducts);
CartRouter.post('/retrieve-saved-products',auth(),authorizeRole('user',"admin"),cartControllers.retrieveProducts);
CartRouter.post('/clear-saved-products',auth(),authorizeRole('user',"admin"),cartControllers.clearProductsList);
CartRouter.post('/share',auth(),authorizeRole('user',"admin"),cartControllers.generateSharedCartLink);
CartRouter.get('/shared-cart/:token',cartControllers.getSharedCart);














export default CartRouter;