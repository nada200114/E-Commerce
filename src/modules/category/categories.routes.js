import * as categoriesValidation from"./categories.validation.js";
import * as categoriesController from "./categories.controller.js";
import auth from "../../middleware/authentication.js";
import  authorizeRole  from "../../middleware/authorizedRole.js";
import { validation } from "../../middleware/validation.js";
import { Router } from "express";
import { multerHost, validExtention } from "../../utils/multerHost.js";
import  subcategoriesRouter  from "../subCategories/subCategories.routes.js";




const categoryRouter = new Router();
categoryRouter.use('/:categoryID/subCategories',subcategoriesRouter)

categoryRouter.get('/',categoriesController.getAllCategories)
categoryRouter.get('/all',categoriesController.getAllCategoriesInfo);

categoryRouter.get('/category-info/:categoryID',categoriesController.categoryAndSubcategory)
categoryRouter.post('/add',auth(),authorizeRole('admin'),multerHost(validExtention.image).single("image"),categoriesController.createCategory);
categoryRouter.get('/:categoryID',categoriesController.getCategoryByID)
categoryRouter.put('/:categoryID',auth(),authorizeRole('admin'), multerHost(validExtention.image).single("image"), categoriesController.updateCategory);

categoryRouter.delete('/:categoryID',auth(),authorizeRole('admin'),categoriesController.deleteCategory);


export default categoryRouter;