import { AppError } from "./classError";
import cloudinary from "./cloudinary";

export const uploadFile=async(filePath,folderPath)=>{
    return cloudinary.uploader.upload(filePath,{folder:folderPath}).catch(()=>{

    })

}

export const deleteFile=async(public_id)=>{
    return  cloudinary.uploader.destroy(public_id).catch(()=>{
        throw new AppError("Error deleting file from cloudinary",500)

    })
}