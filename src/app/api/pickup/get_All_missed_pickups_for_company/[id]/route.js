import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server"; // Import NextResponse

export async function GET(req, { params }) {
    let { id } = params;
    id = parseInt(id);

    // Ensure the id is a valid number
    if (isNaN(id)) {
        return NextResponse.json({
            success: false,
            message: 'Invalid company ID',
        }, { status: 400 });
    }

    let all_missed_pickups = null;

    // Begin transaction
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Begin transaction

        // Fetch all missed pickups that are not completed for the given company id
        all_missed_pickups = await client.query(
            'SELECT mp.status, mp.missed_pickup_id , mp.created_at, mp.unclean_img , area.name FROM missed_pickup mp join area on area.area_id = mp.area_id WHERE mp.company_id = $1 AND mp.status != $2',
            [id, "completed"]
        );

        // Log all returned rows
        console.log(all_missed_pickups.rows);

        // Check if no rows are returned and handle empty results
        if (all_missed_pickups.rows.length === 0) {
            await client.query('COMMIT'); // Commit the transaction if no data is found
            return NextResponse.json({
                success: true,
                data: [],
                message: 'No missed pickups found for the given company ID',
            }, { status: 200 });
        }

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
