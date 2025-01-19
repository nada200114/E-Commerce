import { Router } from "express";
import * as productsController from "./products.controller.js";
import auth from "../../middleware/authentication.js";
import authorizeRole from "../../middleware/authorizedRole.js";
import { multerHost, validExtention } from "../../utils/multerHost.js";
const productsRouter = Router();

productsRouter.post(
  "/",
  auth(),
  authorizeRole("admin"),
  multerHost(validExtention.image).fields([
    { name: "image", maxCount: 1 },
    { name: "coverImages", maxCount: 3 },
  ]),
  productsController.createProduct
);
productsRouter.put(
  "/:productId",
  auth(),
  authorizeRole("admin"),
  multerHost(validExtention.image).fields([
    { name: "image", maxCount: 1 },
    { name: "coverImages", maxCount: 3 },
  ]),
  productsController.updateProduct
);

productsRouter.delete(
  "/:productId",
  auth(),
  authorizeRole("admin"),
  multerHost(validExtention.image).fields([
    { name: "image", maxCount: 1 },
    { name: "coverImages", maxCount: 3 },
  ]),
  productsController.deleteProduct
);



export default productsRouter;