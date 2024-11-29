import { NextResponse } from 'next/server';
import { pool } from '../../../../../database/database';

export async function GET(req, { params }) {
    const { company_id } = params;
    console.log("Company id got: ", company_id);
    
    const client = await pool.connect();

    try {
        // Begin transaction
        await client.query('BEGIN');

        // Fetch the company rating
        const get_rating = await client.query(
            `SELECT avg_rating FROM company WHERE user_id = $1`, 
            [company_id]
        );

        console.log("Rating got: ", get_rating);

        // Commit transaction
        await client.query('COMMIT');

        // Return the response with the rating data
        return NextResponse.json({
            message: "Company rating fetched!", 
            data: get_rating.rows[0].avg_rating, 
            success: true
        });

    } catch (error) {
        // Rollback the transaction in case of error
        await client.query('ROLLBACK');
        console.error("Error fetching company rating:", error);

        return NextResponse.json({
            error: "Internal server error",
            success: false
        }, { status: 500 });
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
