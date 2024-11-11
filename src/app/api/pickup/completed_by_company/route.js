import { pool } from "../../../../database/database";
import { writeFile } from "fs/promises";
import { upload_to_cloundiary } from "@/utils/cloudinary";
import { NextResponse } from "next/server"
import * as geminiAi from "@/utils/geminiAi";


export async function PUT(req) {
    //let { missed_pickup_id, userId } = await req.json();
    //missed_pickup_id = parseInt(missed_pickup_id);
   // userId = parseInt(userId);
    const data = await req.formData();
    const clean_or_unclean_image = data.get('clean_or_unclean_image');
    const userId = data.get('userId');
    const missed_pickup_id = data.get('missed_pickup_id');
    //Sab say pehly image check karlo sahi daali hai ya nahi
    //All checks related to image
    if(!clean_or_unclean_image){
        return NextResponse.json({ "message" : "no image found" , success:false })
    }
    
    //Locally storing
    const clean_or_unclean_image_buffer = await clean_or_unclean_image.arrayBuffer();
    const clean_or_unclean_image_buffer_stream = Buffer.from(clean_or_unclean_image_buffer);
    const path = `./public/${clean_or_unclean_image.name}`
    await writeFile(path,clean_or_unclean_image_buffer_stream)
    
    //Gemini ka kaam
    const clean_or_unclean = await geminiAi.clean_or_unclean(path)
    const clean_or_unclean_fin = clean_or_unclean
    .split("\n") // Split the string into lines
    .filter(line => line.trim() !== "") // Remove empty lines  
    
    //cloudinary wala kaam
    const upload_clean_or_unclean_image_to_cloud = await upload_to_cloundiary(path)
    if(!upload_clean_or_unclean_image_to_cloud){
        return NextResponse.json({ "message" : "Unable to upload to cloundinary" , success:false })
    }    
    
    //Check kay image has been classified as unclean or clean?
    function convertToNumbers(data) {
        // Trim the whitespace and split by spaces
        const splitData = data.trim().split(' ');
        // Map each split element to an integer
        const numbers = splitData.map(Number);
        return numbers;
    }
    const number = convertToNumbers(clean_or_unclean); 

    console.log("Number by Gemini! -> " , number );
    

    if(number[0] == 1){    //Image classified as unclean - Rok do!
        return NextResponse.json({ "message" : "Image classified as unclean" , success:false })        
    }

    // Properly log the variables
    console.log("missed_pickup_id:", missed_pickup_id, "userId:", userId);

    try {
        // Fetch the missed pickup based on the provided IDs and ensure it's not completed
        const pickup = await pool.query(
            "SELECT * FROM missed_pickup WHERE missed_pickup_id = $1 AND company_id = $2 AND status != $3",
            [missed_pickup_id, userId, "completed"]
        );     
        
        console.log("Pickups : ", pickup);
        

        // Handle the case where no missed pickup is found
        if (pickup.rows.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'No missed pickup found for the provided IDs',
                }),
                { status: 400 }
            );
        }

        let updatedStatus = "";

        // Update status based on the current status
        if (pickup.rows[0].status === "pending") {
            updatedStatus = "marked completed by company";
        } 
        else if (pickup.rows[0].status === "marked completed by user") {
            updatedStatus = "completed";
        }

        // Update the status in the missed_pickup table
        const updatedPickup = await pool.query(
            'UPDATE missed_pickup SET status = $1 WHERE missed_pickup_id = $2 AND company_id = $3 RETURNING *',
            [updatedStatus, missed_pickup_id, userId]
        );

        // Log the updated row
        console.log(updatedPickup.rows[0]);

        // Return success response with the updated pickup data
        return new Response(
            JSON.stringify({
                success: true,
                data: updatedPickup.rows[0],
                message: 'Missed pickup updated successfully',
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error: ", error);

        // Return error response
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to update missed pickup',
                error: error.message,
            }),
            { status: 500 }
        );
    }
}









