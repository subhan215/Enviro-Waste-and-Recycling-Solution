import { pool } from "../../../../database/database";
import { writeFile } from "fs/promises";
import { upload_to_cloundiary } from "@/utils/cloudinary";
import { NextResponse } from "next/server";
import * as geminiAi from "@/utils/geminiAi";

export async function POST(req) {
    const data = await req.formData();
    const clean_or_unclean_image = data.get('clean_or_unclean_image');
    const userId = data.get('userId');
    const areaId = data.get('areaId');

    // Check if the image is provided
    if (!clean_or_unclean_image) {
        return NextResponse.json({ "message": "No image found", success: false });
    }

    // Locally storing the image
    const clean_or_unclean_image_buffer = await clean_or_unclean_image.arrayBuffer();
    const clean_or_unclean_image_buffer_stream = Buffer.from(clean_or_unclean_image_buffer);
    const path = `./public/${clean_or_unclean_image.name}`;
    await writeFile(path, clean_or_unclean_image_buffer_stream);

    // Call Gemini AI to classify the image
    const clean_or_unclean = await geminiAi.clean_or_unclean(path);
    //const clean_or_unclean_fin = clean_or_unclean
       // .split("\n")
        //.filter(line => line.trim() !== "");

    // Upload the image to Cloudinary
    const upload_clean_or_unclean_image_to_cloud = await upload_to_cloundiary(path);
    if (!upload_clean_or_unclean_image_to_cloud) {
        return NextResponse.json({ "message": "Unable to upload to Cloudinary", success: false });
    }

    // Check if the image is clean or unclean
    function convertToNumbers(data) {
        const splitData = data.trim().split(' ');
        return splitData.map(Number);
    }
    const number = convertToNumbers(clean_or_unclean);

    if (number == 0) { // Image classified as clean
        return NextResponse.json({ "message": "Image classified as clean", success: false });
    }

    console.log("userId:", userId, "areaId:", areaId);

    let missed_pickup = null;

    // Begin transaction to ensure atomicity
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction

        // Fetch companyId based on areaId
        const companyResult = await client.query("SELECT company_id FROM area WHERE area_id = $1", [areaId]);
        if (companyResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No company found for the provided area ID',
            }, { status: 400 });
        }
        const companyId = companyResult.rows[0].company_id;

        // Check for recent missed pickup for this user and area
        const checkPickupResult = await client.query(
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
            //const hoursDifference = (currentTime - lastPickupTime) / (1000 * 60 * 60);
            console.log("LastPickupTime: ", lastPickupTime, "current time: ", currentTime);
            // If it's less than 24 hours since the last pickup, don't allow another one
            // Uncomment the below code if you want to restrict pickups within 24 hours
            // if (hoursDifference < 24) {
            //     return NextResponse.json({
            //         success: false,
            //         message: 'A missed pickup can only be created 24 hours after the previous one.',
            //     }, { status: 400 });
            // }
        }

        // Insert missed pickup into the database
        missed_pickup = await client.query(
            'INSERT INTO missed_pickup(user_id, area_id, status, company_id , created_at, unclean_img) VALUES ($1, $2, $3, $4 , $5, $6) RETURNING *', 
            [userId, areaId, "pending", companyId , new Date(), upload_clean_or_unclean_image_to_cloud.url]
        );
        console.log(missed_pickup.rows[0]);

        // Insert notification for the missed pickup
        const notificationMessage = "A new missed pickup is reported";
        const notificationIdResult = await client.query(
            'INSERT INTO notification(content) VALUES ($1) RETURNING notification_id',
            [notificationMessage]
        );
        const notificationId = notificationIdResult.rows[0].notification_id;
        await client.query(
            'INSERT INTO notification_company(notification_id, company_id) VALUES ($1, $2)',
            [notificationId, companyId]
        );

        // Commit the transaction
        await client.query('COMMIT');
    } catch (error) {
        // Rollback the transaction in case of error
        await client.query('ROLLBACK');
        console.error("Error: ", error);

        return NextResponse.json({
            success: false,
            message: 'Failed to create missed pickup',
            error: error.message
        }, { status: 500 });
    } finally {
        // Release the client back to the pool
        client.release();
    }

    // Return success response
    return NextResponse.json({
        success: true,
        data: missed_pickup.rows,
        message: 'Missed pickup created successfully',
    }, { status: 200 });
}
