import Joi from 'joi';
import { generalFields } from '../../utils/generalFields.js';

export const signUpSchema={
    body:Joi.object({
        name:Joi.string().required(),
        email:Joi.string().email().required(),
        password:Joi.string().required(),
        confirmPassword:Joi.string().valid(Joi.ref("password")),
        phone: Joi.array().items(Joi.string().min(10).max(15)).required(), // Fix phone format

        age:Joi.string().required(),
        address:Joi.array().items(Joi.string()) ,
        role: Joi.string().valid('admin', 'user').required() 
 
    })
}

export const signInSchema = {
    body: Joi.object({
      email: generalFields.email.required(),
      password: generalFields.password.required(),
    }),
  };
  
  export const forgotPasswordSchema = {
    body: Joi.object({
      email: generalFields.email.required(),
    }),
  };
  
  export const resetPasswordSchema = {
    body: Joi.object({
      newPassword: Joi.string().min(6).required(),
    }),
  };
  