import { pool } from "../../../../database/database";
import { writeFile, unlink } from "fs/promises";
import { upload_to_cloundiary } from "@/utils/cloudinary";
import { NextResponse } from "next/server";
import * as geminiAi from "@/utils/geminiAi";
import path from "path";

export async function POST(req) {
    let filePath = null;
    let client = null;

    try {
        const data = await req.formData();
        const clean_or_unclean_image = data.get('clean_or_unclean_image');
        const userId = data.get('userId');
        const areaId = data.get('areaId');

        // Validate required fields
        if (!userId || !areaId) {
            return NextResponse.json({
                message: "User ID and Area ID are required",
                success: false
            }, { status: 400 });
        }

        // Check if the image is provided
        if (!clean_or_unclean_image) {
            return NextResponse.json({
                message: "No image found",
                success: false
            }, { status: 400 });
        }

        // Generate unique filename to avoid conflicts
        // Use /tmp directory for serverless environments (Vercel, etc.)
        const uniqueFileName = `${Date.now()}-${clean_or_unclean_image.name}`;
        filePath = path.join('/tmp', uniqueFileName);

        // Locally storing the image
        const clean_or_unclean_image_buffer = await clean_or_unclean_image.arrayBuffer();
        const clean_or_unclean_image_buffer_stream = Buffer.from(clean_or_unclean_image_buffer);

        try {
            await writeFile(filePath, clean_or_unclean_image_buffer_stream);
        } catch (writeError) {
            console.error("File write error:", writeError);
            return NextResponse.json({
                message: "Failed to save image temporarily",
                success: false,
                error: writeError.message
            }, { status: 500 });
        }

        // Call AI to classify the image
        let clean_or_unclean;
        try {
            clean_or_unclean = await geminiAi.clean_or_unclean(filePath);
            console.log("AI Classification result:", clean_or_unclean);
        } catch (aiError) {
            console.error("AI classification error:", aiError);
            // Clean up file
            try { await unlink(filePath); } catch {}
            return NextResponse.json({
                message: "AI image classification failed. Please try again.",
                success: false,
                error: aiError.message
            }, { status: 500 });
        }

        // Upload the image to Cloudinary
        let upload_clean_or_unclean_image_to_cloud;
        try {
            upload_clean_or_unclean_image_to_cloud = await upload_to_cloundiary(filePath);
        } catch (cloudError) {
            console.error("Cloudinary upload error:", cloudError);
            return NextResponse.json({
                message: "Failed to upload image to cloud storage",
                success: false,
                error: cloudError.message
            }, { status: 500 });
        }

        if (!upload_clean_or_unclean_image_to_cloud) {
            return NextResponse.json({
                message: "Unable to upload to Cloudinary",
                success: false
            }, { status: 500 });
        }

        // Check if the image is clean or unclean
        function convertToNumbers(data) {
            const splitData = data.trim().split(' ');
            return splitData.map(Number);
        }
        const number = convertToNumbers(clean_or_unclean);

        if (number[0] === 0) { // Image classified as clean
            return NextResponse.json({
                message: "Image classified as clean. No missed pickup detected.",
                success: false
            }, { status: 400 });
        }

        console.log("userId:", userId, "areaId:", areaId);

        let missed_pickup = null;

        // Begin transaction to ensure atomicity
        client = await pool.connect();

        await client.query('BEGIN'); // Start transaction

        // Fetch companyId based on areaId
        const companyResult = await client.query(
            "SELECT company_id FROM area WHERE area_id = $1",
            [areaId]
        );

        if (companyResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({
                success: false,
                message: 'No company found for the provided area ID',
            }, { status: 400 });
        }

        const companyId = companyResult.rows[0].company_id;

        if (!companyId) {
            await client.query('ROLLBACK');
            return NextResponse.json({
                success: false,
                message: 'No waste management company is assigned to your area yet',
            }, { status: 400 });
        }

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
            console.log("LastPickupTime: ", lastPickupTime, "current time: ", currentTime);
        }

        // Insert missed pickup into the database
        missed_pickup = await client.query(
            'INSERT INTO missed_pickup(user_id, area_id, status, company_id, created_at, unclean_img) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, areaId, "pending", companyId, new Date(), upload_clean_or_unclean_image_to_cloud.url]
        );
        console.log("Missed pickup created:", missed_pickup.rows[0]);

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

        // Return success response
        return NextResponse.json({
            success: true,
            data: missed_pickup.rows,
            message: 'Missed pickup created successfully',
        }, { status: 200 });

    } catch (error) {
        // Rollback the transaction in case of error
        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch {}
        }

        console.error("Report missed pickup error:", error);

        return NextResponse.json({
            success: false,
            message: 'Failed to create missed pickup',
            error: error.message
        }, { status: 500 });
    } finally {
        // Release the client back to the pool
        if (client) {
            client.release();
        }
    }
}
