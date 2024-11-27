import {pool} from "../../../../database/database"
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Query to get all agreements
        const result = await pool.query('SELECT * FROM agreement');

        // Return the result in a response
        return NextResponse.json({
            success: true,
            data: result.rows,  // Return all the agreements
        });
    } catch (error) {
        console.error('Error fetching agreements:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch agreements',
        });
    }
}
