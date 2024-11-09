import { writeFile } from "fs/promises";
import { pool } from "../../../database/database";
import { upload_to_cloundiary } from "../../../utils/cloudinary";
import { NextResponse } from "next/server"
import * as geminiAi from "../../../utils/geminiAi"



 //https://www.reddit.com/r/nextjs/comments/17kmu78/how_to_use_multer_in_nextjs_13_using_app_directory/?rdt=40702
 //https://www.youtube.com/watch?v=d_N0_i1IvCI

export async function POST(req) {
    console.log("Here");
    const data = await req.formData();
    const clean_or_unclean_image = data.get('clean_or_unclean_image');
    if(!clean_or_unclean_image){
        return NextResponse.json({ "message" : "no image found" , success:false })
    }
    const clean_or_unclean_image_buffer = await clean_or_unclean_image.arrayBuffer();
    const clean_or_unclean_image_buffer_stream = Buffer.from(clean_or_unclean_image_buffer);
    const path = `./public/${clean_or_unclean_image.name}`
    await writeFile(path,clean_or_unclean_image_buffer_stream)
    

    const clean_or_unclean = await geminiAi.clean_or_unclean(path)
    const clean_or_unclean_fin = clean_or_unclean
    .split("\n") // Split the string into lines
    .filter(line => line.trim() !== "") // Remove empty lines    

    console.log(typeof(clean_or_unclean_fin[0]));
    

    //cloudinary wala kaam
    const upload_clean_or_unclean_image_to_cloud = await upload_to_cloundiary(path)
    if(!upload_clean_or_unclean_image_to_cloud){
        return NextResponse.json({ "message" : "Unable to upload to cloundinary" , success:false })
    }



    function convertToNumbers(data) {
        // Trim the whitespace and split by spaces
        const splitData = data.trim().split(' ');
        // Map each split element to an integer
        const numbers = splitData.map(Number);
        return numbers;
    }
    
    // Convert the data
    const numbers = convertToNumbers(clean_or_unclean); // [0]
    //const numbers2 = convertToNumbers(data2); // [1, 8]
    
    console.log(numbers); 
   // console.log(numbers2); 



    return NextResponse.json({"message" : "File uploaded" , data : numbers ,success : true })



}