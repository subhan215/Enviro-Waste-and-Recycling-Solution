import { pool } from "../../../../database/database";
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Begin transaction
        await pool.query('BEGIN');

        // Query to get all agreements
        const result = await pool.query('SELECT * FROM agreement');

        // Commit transaction
        await pool.query('COMMIT');

        // Return the result in a response
        return NextResponse.json({
            success: true,
            data: result.rows,  // Return all the agreements
        });
    } catch (error) {
        // Rollback transaction in case of an error
        await pool.query('ROLLBACK');

        console.error('Error fetching agreements:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch agreements',
        });
    }
}
