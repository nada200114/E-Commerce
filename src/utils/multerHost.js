import multer from"multer";
import { AppError } from "./classError.js";



export const validExtention={
    image:["image/jpeg","image/jpg","image/png","image/webp"],
    pdf:["application/pdf"],
    video:["video/mp4","video/mkv"],
}
export const multerHost=(customValidation)=>{
const storage=multer.diskStorage({})

const fileFilter=function(req,file,cb){
    if(customValidation.includes(file.mimetype)){
        cb(null,true);

    }
    else{
        cb(new AppError("Invalid file : " + file.mimetype,500),false); 
    }
   
    
}

const upload=multer({
    storage:storage,
    fileFilter:fileFilter
    
})

return upload;
}
