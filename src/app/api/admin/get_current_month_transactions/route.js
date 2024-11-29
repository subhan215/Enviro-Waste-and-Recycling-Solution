import { NextResponse } from 'next/server';
import { pool } from '../../../../database/database';

export async function GET() {
    try {
        // Begin transaction
        await pool.query('BEGIN');

        // Get the current date and the first day of the current month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Query to get all approved transactions from the current month
        const query = `SELECT * FROM rewardconversions WHERE status = 'Approved' AND created_at >= $1`;
        const { rows } = await pool.query(query, [firstDayOfMonth]);

        // Commit transaction
        await pool.query('COMMIT');

        return NextResponse.json({
            success: true,
            data: rows,
        });
    } catch (error) {
        // Rollback transaction in case of an error
        await pool.query('ROLLBACK');
        console.error('Error fetching current month approved transactions:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch current month approved transactions',
        }, {
            status: 500,
        });
    }
}
