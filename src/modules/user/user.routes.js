import * as userControllers from "./user.controller.js";
import * as userValidation from'./user.validation.js';
import {validation} from '../../middleware/validation.js';

import { Router } from "express";

const router = Router();

// User routes

router.post("/signup",validation(userValidation.signUpSchema), userControllers.signup);
router.get('/confirm-email/:token', userControllers.confirm);
router.get('/reconfirm-email/:refreshToken', userControllers.reConfirm);
router.post('/login', validation(userValidation.signInSchema),userControllers.login);
router.post('/forget-password', validation(userValidation.forgotPasswordSchema),userControllers.forgetPassword);
router.post('/reset-password/:token', validation(userValidation.resetPasswordSchema),userControllers.resetPassword);






export default router;