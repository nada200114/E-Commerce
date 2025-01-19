
import joi from 'joi';
import mongoose from 'mongoose';


const objectIdValidation=(value,helper)=>{
    return mongoose.Types.ObjectId.isValid(value)?true:helper.message("Invalid ID");
}
export const generalFields={
    email: joi.string().email(),
      password: joi.string(),
      file: joi.object({
        size:joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().required(),


      }),
      headers:joi.object({
        'accept': joi.string(),
        'accept-encoding': joi.string(),
        'connection': joi.string(),
        'postman-token': joi.string(),

        'host': joi.string(),
        'origin': joi.string(),
        'cache-control': joi.string(),
        'cookie': joi.string(),
        'content-type': joi.string(),
        'content-length': joi.number(),
      }),
      id:joi.string().custom(objectIdValidation).required(),
}