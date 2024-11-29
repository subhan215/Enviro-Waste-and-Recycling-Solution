import { NextResponse } from "next/server";
import { pool } from "../../../../../database/database";

export async function GET(req, { params }) {
    const { user_id } = params;
    console.log(user_id);

    if (!user_id) {
        return NextResponse.json({ 
            error: 'User ID is required' 
        }, { 
            status: 400 
        });
    }

    const client = await pool.connect();

    try {
        // Begin the transaction
        await client.query('BEGIN');

        // Query to fetch distinct schedules based on user_id and join with trucks
        const query = `
          SELECT DISTINCT 
                s.*,
                t.truckid,
                t.licenseplate,
                t.capacity
          FROM schedule s
          LEFT JOIN trucks t ON s.truck_id = t.truckid
          WHERE s.user_id = $1 and s.status != 'done';
        `;

        const { rows } = await client.query(query, [user_id]);

        if (rows.length === 0) {
            // Commit the transaction
            await client.query('COMMIT');
            return NextResponse.json({
                message: 'No schedules found for this user'
            }, { status: 404 });
        }

        // Commit the transaction
        await client.query('COMMIT');

        // Return the fetched schedules
        return NextResponse.json(rows, { 
            status: 200 
        });

    } catch (error) {
        // Rollback the transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error fetching schedules:', error);

        return NextResponse.json({
            error: 'Internal server error'
        }, { 
            status: 500 
        });
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
