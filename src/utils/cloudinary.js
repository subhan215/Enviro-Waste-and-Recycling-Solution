import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY ,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    //uploading file on cloudinary

    const upload_to_cloundiary = async (local_file_path) => {
        try {
            if(local_file_path){
                const response =  await cloudinary.uploader.upload(local_file_path , {resource_type:"auto"})
                console.log(`File uploaded to cloudinary successfully `, response.url)
                console.log(`cloudinary response -> ` ,response)
                fs.unlinkSync(local_file_path)
                return response
            }
            else{
                return null
            }
            } catch (error) {
                console.log(error)
                fs.unlinkSync(local_file_path)
                return null
        }
    }
    
    export {upload_to_cloundiary}