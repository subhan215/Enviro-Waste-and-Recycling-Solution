import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server"; // Import NextResponse

export async function GET(req, { params }) {
    let { id } = params;
    id = parseInt(id);

    // Ensure the id is a valid number
    if (isNaN(id)) {
        return NextResponse.json({
            success: false,
            message: 'Invalid user ID',
        }, { status: 400 });
    }

    let all_missed_pickups = null;

    // Begin transaction
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Begin transaction

        // Fetch all missed pickups that are not completed for the given user id
        all_missed_pickups = await client.query(
            'SELECT * FROM missed_pickup join company on company.user_id = missed_pickup.company_id WHERE missed_pickup.user_id = $1 AND missed_pickup.status != $2',
            [id, "completed"]
        );

        // Log all returned rows
        console.log(all_missed_pickups.rows);

        // Commit the transaction
        await client.query('COMMIT');
        
    } catch (error) {
        // Rollback the transaction in case of an error
        await client.query('ROLLBACK');
        console.error("Error: ", error);

        // Return error response
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch missed pickups',
            error: error.message,
        }, { status: 500 });
    } finally {
        // Release the client back to the pool
        client.release();
    }

    // Return success response with the fetched data
    return NextResponse.json({
        success: true,
        data: all_missed_pickups.rows,
        message: 'All missed pickups fetched!',
    }, { status: 200 });
}
