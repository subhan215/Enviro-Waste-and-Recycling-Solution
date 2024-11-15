// import { pool } from "../../../../database/database";

// export async function POST(req) {
//     let { userId, areaId } = await req.json();
//     userId = parseInt(userId);
//     areaId = parseInt(areaId);
    
//     console.log("userId:", userId, "areaId:", areaId);

//     let missed_pickup = null; 
    
//     try {   
//         // Fetch companyId based on areaId
//         const companyResult = await pool.query("SELECT company_id FROM area WHERE area_id = $1", [areaId]);

//         if (companyResult.rows.length === 0) {
//             return new Response(
//                 JSON.stringify({
//                     success: false,
//                     message: 'No company found for the provided area ID',
//                 }),
//                 { status: 400 }
//             );
//         }

//         const companyId = companyResult.rows[0].company_id;

//         // Check if a recent missed pickup exists for this user and area
//         const checkPickupResult = await pool.query(
//             `SELECT * FROM missed_pickup 
//             WHERE user_id = $1 AND area_id = $2 
//             AND (status != 'completed' AND status != 'marked completed by company')
//             ORDER BY created_at ASC
//             LIMIT 1`, 
//             [userId, areaId]
//         );

//         if (checkPickupResult.rows.length > 0) {
//             const lastPickup = checkPickupResult.rows[0];
//             const lastPickupTime = new Date(lastPickup.created_at);
//             const currentTime = new Date();

//             // Calculate the time difference in hours
//             const hoursDifference = (currentTime - lastPickupTime) / (1000 * 60 * 60);
//             console.log("LastPickupTime: " , lastPickupTime , "current time: " , currentTime) ; 
//             // If it's less than 24 hours since the last pickup, don't allow another one
//             // if (hoursDifference < 24) {
//             //     return new Response(
//             //         JSON.stringify({
//             //             success: false,
//             //             message: 'A missed pickup can only be created 24 hours after the previous one.',
//             //         }),
//             //         { status: 400 }
//             //     );
//             // }
//         }

//         // Automatically create a new missed pickup if the current time is 1 PM
//         const currentTime = new Date();
//         const currentHour = currentTime.getHours();


        
//         //Zabardsasti!

//         missed_pickup = await pool.query(
//             'INSERT INTO missed_pickup(user_id, area_id, status, company_id , created_at) VALUES ($1, $2, $3, $4 , $5) RETURNING *', 
//             [userId, areaId, "pending", companyId , new Date()]
//         );
//         console.log(missed_pickup.rows[0]);



//         // if (currentHour >= 13) { // 13:00 is 1 PM in 24-hour format
//         //     missed_pickup = await pool.query(
//         //         'INSERT INTO missed_pickup(user_id, area_id, status, company_id , created_at) VALUES ($1, $2, $3, $4 , $5) RETURNING *', 
//         //         [userId, areaId, "pending", companyId , new Date()]
//         //     );
//         //     console.log(missed_pickup.rows[0]);
//         // }
//         // else {
//         //     return new Response(
//         //         JSON.stringify({
//         //             success: false,
//         //             message: 'Missed pickup can only be created at 1 PM or after 24 hours since the last pickup.',
//         //         }),
//         //         { status: 400 }
//         //     );
//         // }

//     } 
//     catch (error) {
//         console.error("Error: ", error);
        
//         return new Response(
//             JSON.stringify({
//                 success: false,
//                 message: 'Failed to create missed pickup',
//                 error: error.message
//             }),
//             { status: 500 }
//         );
//     }

//     return new Response(
//         JSON.stringify({
//             success: true,
//             data: missed_pickup.rows,
//             message: 'Missed pickup created successfully',
//         }),
//         { status: 200 }
//     );
// }






import { pool } from "../../../../database/database";
import { writeFile } from "fs/promises";
import { upload_to_cloundiary } from "@/utils/cloudinary";
import { NextResponse } from "next/server"
import * as geminiAi from "@/utils/geminiAi";

export async function POST(req) {
    // let { userId, areaId } = await req.json();
    // userId = parseInt(userId);
    // areaId = parseInt(areaId);
    const data = await req.formData();
    const clean_or_unclean_image = data.get('clean_or_unclean_image');
    const userId = data.get('userId');
    const areaId = data.get('areaId');

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

    if(number == 0){    //Image classified as clean - Rok do!
        return NextResponse.json({ "message" : "Image classified as clean" , success:false })        
    }





    
    console.log("userId:", userId, "areaId:", areaId);

    let missed_pickup = null; 
    
    try {   
        // Fetch companyId based on areaId
        const companyResult = await pool.query("SELECT company_id FROM area WHERE area_id = $1", [areaId]);

        if (companyResult.rows.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'No company found for the provided area ID',
                }),
                { status: 400 }
            );
        }

        const companyId = companyResult.rows[0].company_id;

        // Check if a recent missed pickup exists for this user and area
        const checkPickupResult = await pool.query(
            `SELECT * FROM missed_pickup 
            WHERE user_id = $1 AND area_id = $2 
            AND (status != 'completed' AND status != 'marked completed by company')
            ORDER BY created_at ASC
            LIMIT 1`, 
            [userId, areaId]
        );

        if (checkPickupResult.rows.length > 0) {
            const lastPickup = checkPickupResult.rows[0];
            const lastPickupTime = new Date(lastPickup.created_at);
            const currentTime = new Date();

            // Calculate the time difference in hours
            const hoursDifference = (currentTime - lastPickupTime) / (1000 * 60 * 60);
            console.log("LastPickupTime: " , lastPickupTime , "current time: " , currentTime) ; 
            // If it's less than 24 hours since the last pickup, don't allow another one
            // if (hoursDifference < 24) {
            //     return new Response(
            //         JSON.stringify({
            //             success: false,
            //             message: 'A missed pickup can only be created 24 hours after the previous one.',
            //         }),
            //         { status: 400 }
            //     );
            // }
        }

        // Automatically create a new missed pickup if the current time is 1 PM
        const currentTime = new Date();
        const currentHour = currentTime.getHours();


        
        //Zabardsasti!

        missed_pickup = await pool.query(
            'INSERT INTO missed_pickup(user_id, area_id, status, company_id , created_at, unclean_img) VALUES ($1, $2, $3, $4 , $5, $6) RETURNING *', 
            [userId, areaId, "pending", companyId , new Date(), upload_clean_or_unclean_image_to_cloud.url ]
        );
        console.log(missed_pickup.rows[0]);



        // if (currentHour >= 13) { // 13:00 is 1 PM in 24-hour format
        //     missed_pickup = await pool.query(
        //         'INSERT INTO missed_pickup(user_id, area_id, status, company_id , created_at) VALUES ($1, $2, $3, $4 , $5) RETURNING *', 
        //         [userId, areaId, "pending", companyId , new Date()]
        //     );
        //     console.log(missed_pickup.rows[0]);
        // }
        // else {
        //     return new Response(
        //         JSON.stringify({
        //             success: false,
        //             message: 'Missed pickup can only be created at 1 PM or after 24 hours since the last pickup.',
        //         }),
        //         { status: 400 }
        //     );
        // }

    } 
    catch (error) {
        console.error("Error: ", error);
        
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to create missed pickup',
                error: error.message
            }),
            { status: 500 }
        );
    }

    return new Response(
        JSON.stringify({
            success: true,
            data: missed_pickup.rows,
            message: 'Missed pickup created successfully',
        }),
        { status: 200 }
    );
}
