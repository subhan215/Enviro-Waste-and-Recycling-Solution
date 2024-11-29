import { pool } from "../../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    // Extract the company_id from the request parameters
    const { company_id } = params;
    console.log("company_id:", company_id);
    let all_areas;

    // Create a client for transaction handling
    const client = await pool.connect();

    try {
        // Begin transaction
        await client.query('BEGIN');

        // Fetch areas that are not served by the specified company
        const result = await client.query(
            `SELECT area_id, name 
             FROM area 
             WHERE area_id NOT IN (
                 SELECT area_id 
                 FROM recycling_center 
                 WHERE company_id = $1
             )`,
            [company_id] // Pass company_id as a parameter
        );

        all_areas = result;

        console.log(all_areas.rows); // Log all areas fetched

        // Commit transaction after successful fetch
        await client.query('COMMIT');
    } catch (error) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.log("Error:", error);
        return NextResponse.json({
            success: false,
            message: 'Error fetching areas.',
        }, {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        // Release the client back to the pool
        client.release();
    }

    return NextResponse.json({
        success: true,
        data: all_areas.rows,
        message: 'All non-served areas fetched!',
    }, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
