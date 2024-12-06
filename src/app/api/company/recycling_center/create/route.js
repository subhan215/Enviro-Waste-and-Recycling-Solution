import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
    console.log("Create Recycling Center request received");

    const client = await pool.connect();

    try {
        const { company_id, latitude, longitude } = await req.json();

        // Parse and validate input
        const parsedData = {
            company_id: parseInt(company_id, 10),
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
        };
        console.log(parsedData);

        if (
            isNaN(parsedData.company_id) ||
            isNaN(parsedData.latitude) ||
            isNaN(parsedData.longitude) ||
            parsedData.latitude < -90 ||
            parsedData.latitude > 90 ||
            parsedData.longitude < -180 ||
            parsedData.longitude > 180
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid input. Please check your data." },
                { status: 400 }
            );
        }

        // Check if recycling center already exists
        const existingCenterResult = await client.query(
            `SELECT * FROM request_recycling_center WHERE company_id = $1 AND latitude = $2 AND longitude = $3`,
            [parsedData.company_id, parsedData.latitude, parsedData.longitude]
        );

        if (existingCenterResult.rows.length > 0) {
            return NextResponse.json(
                { success: false, message: "Recycling center already exists!" },
                { status: 409 }
            );
        }

        // Insert new recycling center request
        const insertResult = await client.query(
            `INSERT INTO request_recycling_center (company_id, latitude, longitude)
             VALUES ($1, $2, $3) RETURNING *`,
            [parsedData.company_id, parsedData.latitude, parsedData.longitude]
        );

        const newCenterRequest = insertResult.rows[0];
        console.log("New recycling center request created:", newCenterRequest);

        return NextResponse.json(
            { success: true, data: newCenterRequest, message: "Recycling center request created successfully." },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating recycling center request:", error);
        return NextResponse.json(
            { success: false, message: `Error: ${error.message}` },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
