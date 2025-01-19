import { AppError } from "../utils/classError.js";

const dataMethod=["body","query","params","headers","file","files"];

export const validation=(schema)=>{
    return async(req,res,next)=>{
        let arrayError=[];
        dataMethod.forEach((key)=>{
            if(schema[key]){
                const {error}=schema[key].validate(req[key],{abortEarly:false});
                if(error?.details){
                    error.details.forEach((err)=>{
                        arrayError.push(err.message);
                    })
                } 
            }
        })
if(arrayError.length){
    return next(new AppError(arrayError,400))
}
        next()
    }
}


