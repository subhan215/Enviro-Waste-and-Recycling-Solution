import { pool } from "../../../../database/database";
import { writeFile } from "fs/promises";
import { upload_to_cloundiary } from "@/utils/cloudinary";
import { NextResponse } from "next/server";
import * as geminiAi from "@/utils/geminiAi";

export async function POST(req) {
    const data = await req.formData();
    const manhole_image = data.get('manhole_image');
    const userId = data.get('userId');
    const areaId = data.get('areaId');
    const reportType = data.get('reportType'); // lost, open, hidden, damaged
    const description = data.get('description');
    const latitude = data.get('latitude');
    const longitude = data.get('longitude');

    // Check if the image is provided
    if (!manhole_image) {
        return NextResponse.json({ "message": "No image found", success: false });
    }

    // Validate report type
    const validTypes = ['lost', 'open', 'hidden', 'damaged'];
    if (!validTypes.includes(reportType)) {
        return NextResponse.json({ "message": "Invalid report type", success: false });
    }

    // Locally storing the image
    const manhole_image_buffer = await manhole_image.arrayBuffer();
    const manhole_image_buffer_stream = Buffer.from(manhole_image_buffer);
    const path = `./public/${manhole_image.name}`;
    await writeFile(path, manhole_image_buffer_stream);

    // Call Gemini AI to verify the manhole image
    const verification_result = await geminiAi.manhole_verification(path, 'report');

    // Parse the AI result
    function convertToNumbers(data) {
        const splitData = data.trim().split(' ');
        return splitData.map(Number);
    }
    const numbers = convertToNumbers(verification_result);

    if (numbers[0] === 0) {
        return NextResponse.json({ "message": "No manhole issue detected in the image", success: false });
    }

    // Upload the image to Cloudinary
    const upload_manhole_image_to_cloud = await upload_to_cloundiary(path);
    if (!upload_manhole_image_to_cloud) {
        return NextResponse.json({ "message": "Unable to upload to Cloudinary", success: false });
    }

    let manhole_report = null;

    // Begin transaction
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Find a company with manhole_management service approved for this area
        const companyResult = await client.query(
            `SELECT asa.company_id
             FROM area_service_assignment asa
             WHERE asa.area_id = $1 AND asa.service_type = 'manhole_management'
             LIMIT 1`,
            [areaId]
        );

        let companyId = null;
        let status = 'pending';

        if (companyResult.rows.length > 0) {
            companyId = companyResult.rows[0].company_id;
            status = 'assigned';
        }

        // Insert manhole report into the database
        manhole_report = await client.query(
            `INSERT INTO manhole_report(user_id, area_id, company_id, report_type, description, latitude, longitude, before_img, status, created_at, assigned_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [userId, areaId, companyId, reportType, description, latitude, longitude, upload_manhole_image_to_cloud.url, status, new Date(), companyId ? new Date() : null]
        );

        // If company is assigned, send notification
        if (companyId) {
            const notificationMessage = `A new manhole report (${reportType}) has been assigned to you`;
            const notificationIdResult = await client.query(
                'INSERT INTO notification(content) VALUES ($1) RETURNING notification_id',
                [notificationMessage]
            );
            const notificationId = notificationIdResult.rows[0].notification_id;
            await client.query(
                'INSERT INTO notification_company(notification_id, company_id) VALUES ($1, $2)',
                [notificationId, companyId]
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error: ", error);

        return NextResponse.json({
            success: false,
            message: 'Failed to create manhole report',
            error: error.message
        }, { status: 500 });
    } finally {
        client.release();
    }

    return NextResponse.json({
        success: true,
        data: manhole_report.rows,
        message: 'Manhole report created successfully',
    }, { status: 200 });
}
