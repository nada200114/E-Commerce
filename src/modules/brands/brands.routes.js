import { Router } from "express";
import * as brandControllers from'./brands.controller.js';
import auth from "../../middleware/authentication.js";
import  authorizeRole  from "../../middleware/authorizedRole.js";
import { multerHost, validExtention } from "../../utils/multerHost.js";

const router =Router();

// router.get('/',brandControllers)
router.post('/',auth(),authorizeRole('admin'),multerHost(validExtention.image).single("image"),brandControllers.createBrand);
router.get('/',brandControllers.getAllBrands);
router.get('/:brandID',brandControllers.getBrandByID);

router.get('/:brandID',brandControllers.deleteBrand);
router.put('/:brandID',auth(),authorizeRole('admin'),multerHost(validExtention.image).single("image"),brandControllers.updateBrandByID);

router.delete('/:brandID',auth(),authorizeRole('admin'),brandControllers.deleteBrand);

export default router;


