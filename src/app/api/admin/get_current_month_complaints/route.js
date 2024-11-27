import { NextResponse } from 'next/server';
import {pool} from "../../../../database/database"

export async function GET() {
    try {
        // Get the current date and the first day of the current month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Query to get all complaints from the current month where status is 't'
        const result = await pool.query(
            `SELECT * 
             FROM reports 
             where created_at >= $1`, 
            [firstDayOfMonth]
        );

        // Return the result in a response
        return NextResponse.json({
            success: true,
            data: result.rows,  // Return the current month complaints
        });
    } catch (error) {
        console.error('Error fetching current month complaints:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch current month complaints',
        });
    }
}
