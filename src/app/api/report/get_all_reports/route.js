import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req) {
    const client = await pool.connect(); // Get a client for the transaction
    try {
        // Begin the transaction
        await client.query('BEGIN');

        // Query to fetch all reports
        const all_reports = await client.query(`
            SELECT * FROM reports 
            JOIN company ON reports.company_id = company.user_id 
            ORDER BY sentiment_rating DESC
        `);

        console.log("All reports: ", all_reports);

        // Commit the transaction
        await client.query('COMMIT');

        if (all_reports.rows.length !== 0) {
            return NextResponse.json({
                "message": "All reports fetched",
                data: all_reports.rows,
                success: true
            });
        } else {
            return NextResponse.json({
                "message": "No reports yet",
                success: true
            });
        }
    } catch (error) {
        // Rollback the transaction if an error occurs
        await client.query('ROLLBACK');
        console.error("Error fetching reports: ", error);
        
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch reports',
            error: error.message
        });
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
