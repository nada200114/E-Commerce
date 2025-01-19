import joi from 'joi';
import { generalFields } from '../../utils/generalFields.js';

export const createSchema={
    body:joi.object({
        name:joi.string().required(),
    }).required(),
    // file:generalFields.file.required(),
    // headers:generalFields.headers.required()

}