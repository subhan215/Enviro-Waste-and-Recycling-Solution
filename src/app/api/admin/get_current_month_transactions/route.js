import { NextResponse } from 'next/server';
import {pool} from "../../../../database/database"

export async function GET() {
    try {
        // Get the current date and the first day of the current month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Query to get all approved transactions from the current month
        const result = await pool.query(
            `SELECT * 
             FROM rewardconversions 
             WHERE status = 'Approved' 
             AND created_at >= $1`, 
            [firstDayOfMonth]
        );

        // Return the result in a response
        return NextResponse.json({
            success: true,
            data: result.rows,  // Return the current month approved transactions
        });
    } catch (error) {
        console.error('Error fetching current month approved transactions:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch current month approved transactions',
        });
    }
}
