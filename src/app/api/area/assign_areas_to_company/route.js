import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { selectedAreas, company_id, service_type = 'waste_collection' } = await req.json();
    console.log("Selected Areas: ", selectedAreas, "Service Type: ", service_type);

    // Validate service type
    const validServiceTypes = ['waste_collection', 'manhole_management', 'recycling'];
    if (!validServiceTypes.includes(service_type)) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid service type. Must be waste_collection, manhole_management, or recycling.',
            },
            { status: 400 }
        );
    }

    const client = await pool.connect(); // Start a transaction with a client
    try {
        // Begin a database transaction
        await client.query('BEGIN');

        // Loop through the selected areas and insert each one into the database
        for (const area_id of selectedAreas) {
            // Check if request already exists for this area, company, and service type
            const existingRequest = await client.query(
                `SELECT * FROM request_for_area_approval
                 WHERE area_id = $1 AND company_id = $2 AND service_type = $3`,
                [area_id, company_id, service_type]
            );

            if (existingRequest.rows.length === 0) {
                await client.query(
                    `INSERT INTO request_for_area_approval (area_id, company_id, status, service_type)
                     VALUES ($1, $2, $3, $4)`,
                    [area_id, company_id, 'pending', service_type]
                );
            }
        }

        // Commit the transaction
        await client.query('COMMIT');

        return NextResponse.json(
            {
                success: true,
                message: `Request has been created for areas approval (${service_type})!`,
            },
            { status: 200 }
        );
    } catch (error) {
        // Rollback the transaction in case of an error
        await client.query('ROLLBACK');
        console.error("Error creating request for area approval: ", error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create request for area approval.',
                error: error.message,
            },
            { status: 500 }
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
}
