import { pool } from "../../../../database/database";
import { writeFile } from "fs/promises";
import { upload_to_cloundiary } from "@/utils/cloudinary";
import { NextResponse } from "next/server";
import * as geminiAi from "@/utils/geminiAi";

export async function PUT(req) {
    const data = await req.formData();
    const after_image = data.get('after_image');
    const reportId = data.get('report_id');
    const companyId = data.get('company_id');

    // Check if the image is provided
    if (!after_image) {
        return NextResponse.json({ "message": "No image found", success: false });
    }

    // Locally storing the image
    const after_image_buffer = await after_image.arrayBuffer();
    const after_image_buffer_stream = Buffer.from(after_image_buffer);
    const path = `/tmp/${Date.now()}-${after_image.name}`;
    await writeFile(path, after_image_buffer_stream);

    // Call Gemini AI to verify the resolution
    const verification_result = await geminiAi.manhole_verification(path, 'resolution');

    // Parse the AI result
    const isFixed = verification_result.trim() === '1';

    if (!isFixed) {
        return NextResponse.json({
            "message": "The manhole does not appear to be properly fixed. Please ensure the cover is properly in place.",
            success: false
        });
    }

    // Upload the image to Cloudinary
    const upload_after_image_to_cloud = await upload_to_cloundiary(path);
    if (!upload_after_image_to_cloud) {
        return NextResponse.json({ "message": "Unable to upload to Cloudinary", success: false });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update the manhole report
        const result = await client.query(
            `UPDATE manhole_report
             SET after_img = $1, status = 'resolved', resolved_at = $2
             WHERE report_id = $3 AND company_id = $4
             RETURNING *`,
            [upload_after_image_to_cloud.url, new Date(), reportId, companyId]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({
                success: false,
                message: 'Manhole report not found or not assigned to this company'
            }, { status: 404 });
        }

        // Update company's manhole resolution count
        await client.query(
            `UPDATE company SET total_manhole_resolutions = total_manhole_resolutions + 1 WHERE user_id = $1`,
            [companyId]
        );

        // Send notification to user
        const userId = result.rows[0].user_id;
        const notificationMessage = "Your manhole report has been resolved. Please confirm.";
        const notificationIdResult = await client.query(
            'INSERT INTO notification(content) VALUES ($1) RETURNING notification_id',
            [notificationMessage]
        );
        const notificationId = notificationIdResult.rows[0].notification_id;
        await client.query(
            'INSERT INTO notification_user(notification_id, user_id) VALUES ($1, $2)',
            [notificationId, userId]
        );

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            data: result.rows[0],
            message: 'Manhole report marked as resolved'
        }, { status: 200 });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error resolving manhole report:", error);
        return NextResponse.json({
            success: false,
            message: 'Failed to resolve manhole report',
            error: error.message
        }, { status: 500 });
    } finally {
        client.release();
    }
}
