import { Router } from "express";
import * as subcategoryControllers from "./subCategories.controller.js";


import auth from "../../middleware/authentication.js";

import  authorizeRole  from "../../middleware/authorizedRole.js";

import { validation } from "../../middleware/validation.js";

import { multerHost, validExtention } from "../../utils/multerHost.js";


const subcategoriesRouter = new Router({mergeParams: true});
subcategoriesRouter.get('/',subcategoryControllers.getSubCategories);
// subcategoriesRouter.get('/all',subcategoryControllers.getAllSubCategories)


subcategoriesRouter.get('/all',subcategoryControllers.allSubcategoriesWithCategories);
subcategoriesRouter.get('/:subCategoryID',subcategoryControllers.getSubcategory);
subcategoriesRouter.get('/subcategory-info/:subcategoryID', subcategoryControllers.getSubcategoryWithCategory);

subcategoriesRouter.post('/', auth(), authorizeRole('admin'), multerHost(validExtention.image).single("image"),subcategoryControllers.createSubcategory);

subcategoriesRouter.put('/:subCategoryID', auth(), authorizeRole('admin'),multerHost(validExtention.image).single("image"), subcategoryControllers.updateSubcategory);

subcategoriesRouter.delete('/:subCategoryID', auth(), authorizeRole('admin'), subcategoryControllers.deleteSubcategory);

export default subcategoriesRouter