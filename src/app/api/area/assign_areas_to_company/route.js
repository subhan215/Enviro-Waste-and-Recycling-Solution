import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { selectedAreas, company_id } = await req.json();
    console.log("Selected Areas: ", selectedAreas);

    const client = await pool.connect(); // Start a transaction with a client
    try {
        // Begin a database transaction
        await client.query('BEGIN');

        // Loop through the selected areas and insert each one into the database
        for (const area_id of selectedAreas) {
            await client.query(
                `INSERT INTO request_for_area_approval (area_id, company_id, status) 
                 VALUES ($1, $2, $3)`,
                [area_id, company_id, 'pending']
            );
        }

        // Commit the transaction
        await client.query('COMMIT');

        return NextResponse.json(
            {
                success: true,
                message: 'Request has been created for areas approval!',
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
