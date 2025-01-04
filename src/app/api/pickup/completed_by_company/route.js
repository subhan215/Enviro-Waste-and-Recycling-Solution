import { pool } from "../../../../database/database";
import { writeFile } from "fs/promises";
import { upload_to_cloundiary } from "@/utils/cloudinary";
import { NextResponse } from "next/server";
import * as geminiAi from "@/utils/geminiAi";

export async function PUT(req) {
    const client = await pool.connect(); // Acquire a client from the pool

    const data = await req.formData();
    const clean_or_unclean_image = data.get('clean_or_unclean_image');
    const userId = data.get('userId');
    const missed_pickup_id = data.get('missed_pickup_id');

    // All checks related to image
    if (!clean_or_unclean_image) {
        return NextResponse.json({ "message": "No image found", success: false });
    }

    // Locally storing the image
    const clean_or_unclean_image_buffer = await clean_or_unclean_image.arrayBuffer();
    const clean_or_unclean_image_buffer_stream = Buffer.from(clean_or_unclean_image_buffer);
    const path = `./public/${clean_or_unclean_image.name}`;
    await writeFile(path, clean_or_unclean_image_buffer_stream);

    // Gemini AI processing
    const clean_or_unclean = await geminiAi.clean_or_unclean(path);
    /*const clean_or_unclean_fin = clean_or_unclean
        .split("\n") // Split the string into lines
        .filter(line => line.trim() !== "") // Remove empty lines   */

    // Cloudinary upload
    const upload_clean_or_unclean_image_to_cloud = await upload_to_cloundiary(path);
    if (!upload_clean_or_unclean_image_to_cloud) {
        return NextResponse.json({ "message": "Unable to upload to Cloudinary", success: false });
    }

    // Check if the image is classified as clean or unclean
    function convertToNumbers(data) {
        const splitData = data.trim().split(' ');
        return splitData.map(Number);
    }
    const number = convertToNumbers(clean_or_unclean);

    console.log("Number by Gemini! -> ", number);

    if (number[0] == 1) { // Image classified as unclean
        return NextResponse.json({ "message": "Image classified as unclean", success: false });
    }

    // Properly log the variables
    console.log("missed_pickup_id:", missed_pickup_id, "userId:", userId);

    try {
        // Start the transaction
        await client.query('BEGIN');

        // Fetch the missed pickup based on the provided IDs and ensure it's not completed
        const pickup = await client.query(
            "SELECT * FROM missed_pickup WHERE missed_pickup_id = $1 AND company_id = $2 AND status != $3",
            [missed_pickup_id, userId, "completed"]
        );

        console.log("Pickups : ", pickup);

        // Handle the case where no missed pickup is found
        if (pickup.rows.length === 0) {
            await client.query('ROLLBACK'); // Rollback transaction
            return NextResponse.json({
                success: false,
                message: 'No missed pickup found for the provided IDs',
            }, { status: 400 });
        }

        let updatedStatus = "";

        // Update status based on the current status
        if (pickup.rows[0].status === "pending") {
            updatedStatus = "marked completed by company";
        } else if (pickup.rows[0].status === "marked completed by user") {
            updatedStatus = "completed";
        }

        // Update the status in the missed_pickup table
        const updatedPickup = await client.query(
            'UPDATE missed_pickup SET status = $1, clean_img = $4 WHERE missed_pickup_id = $2 AND company_id = $3 RETURNING *',
            [updatedStatus, missed_pickup_id, userId, upload_clean_or_unclean_image_to_cloud.url]
        );

        // Log the updated row
        console.log(updatedPickup.rows[0]);

        // Commit the transaction
        await client.query('COMMIT');

        // Return success response with the updated pickup data
        return NextResponse.json({
            success: true,
            data: updatedPickup.rows[0],
            message: 'Missed pickup updated successfully',
        });
    } catch (error) {
        // Rollback the transaction in case of an error
        await client.query('ROLLBACK');
        console.error("Error: ", error);

        // Return error response
        return NextResponse.json({
            success: false,
            message: 'Failed to update missed pickup',
            error: error.message,
        }, { status: 500 });
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
