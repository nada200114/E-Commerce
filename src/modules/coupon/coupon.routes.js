import { Router } from "express";
import * as couponControllers from './coupon.controller.js';
import auth from "../../middleware/authentication.js";
import authorizeRole from "../../middleware/authorizedRole.js";
import CouponModel from "../../../DB/models/coupon.model.js";


const couponsRouter =Router();

couponsRouter.post(
    "/",
    auth(),
    authorizeRole("admin"),
    couponControllers.createCoupon
  );

  couponsRouter.get(
    "/",
    couponControllers.getAllCoupons
  );
  couponsRouter.get(
    "/:couponID",
    couponControllers.getCouponById
  );
  couponsRouter.put(
    "/:couponID",
    auth(),
    authorizeRole("admin"),
    couponControllers.updateCoupon
    
  )
  couponsRouter.delete(
    "/:couponID",
    auth(),
    authorizeRole("admin"),
    couponControllers.deleteCoupon
    
  )
export default couponsRouter
