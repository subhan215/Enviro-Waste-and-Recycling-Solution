import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function GET() {
    let all_areas;
    const client = await pool.connect(); // Connect to the database to handle the transaction
    try {
        // Begin the transaction
        await client.query('BEGIN');
        
        // Fetch all areas from the database
        all_areas = await client.query('SELECT * FROM area');
        console.log(all_areas.rows);

        // Commit the transaction after fetching the data
        await client.query('COMMIT');

        // Return success response
        return NextResponse.json({
            success: true,
            data: all_areas.rows,
            message: 'All areas fetched successfully!',
        }, {
            status: 200
        });

    } catch (error) {
        // Rollback the transaction in case of an error
        await client.query('ROLLBACK');
        console.error("Error during transaction:", error);

        // Return error response with specific error details
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch areas.',
            error: error.message,
        }, {
            status: 500
        });
    } finally {
        client.release(); // Release the client back to the pool
    }
}
