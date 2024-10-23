import { pool } from "../../../../../database/database";



export async function GET(req, { params }) {
    let { id } = params;
    id = parseInt(id);

    // Ensure the id is a valid number
    if (isNaN(id)) {
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Invalid company ID',
            }),
            { status: 400 }
        );
    }

    let all_missed_pickups = null;

    try {
        // Fetch all missed pickups that are not completed for the given company id
        all_missed_pickups = await pool.query(
            'SELECT status, missed_pickup_id , created_at FROM missed_pickup WHERE company_id = $1 AND status != $2',
            [id, "completed"]
        );

        // Log all returned rows
        console.log(all_missed_pickups.rows);

        // Check if no rows are returned and handle empty results
        if (all_missed_pickups.rows.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    data: [],
                    message: 'No missed pickups found for the given company ID',
                }),
                { status: 200 }
            );
        }

    } catch (error) {
        console.error("Error: ", error);

        // Return error response
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to fetch missed pickups',
                error: error.message,
            }),
            { status: 500 }
        );
    }

    // Return success response with the fetched data
    return new Response(
        JSON.stringify({
            success: true,
            data: all_missed_pickups.rows,
            message: 'All missed pickups fetched!',
        }),
        { status: 200 }
    );
}
