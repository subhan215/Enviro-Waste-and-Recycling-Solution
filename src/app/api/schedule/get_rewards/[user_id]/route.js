import { NextResponse } from "next/server";
import { pool } from "../../../../../database/database";

export async function GET(req, { params }) {
    const user_id = parseInt(params.user_id);
    console.log("User ID: ", user_id);

    const client = await pool.connect();

    try {
        // Begin the transaction
        await client.query('BEGIN');

        // Fetch user rewards from the database
        const user_reward_q = await client.query(
            `SELECT rewards FROM "User" WHERE user_id = $1`, 
            [user_id]
        );

        console.log("User rewards query result: ", user_reward_q);

        // Commit the transaction
        await client.query('COMMIT');

        // Return the response with the fetched data
        return NextResponse.json({
            message: "User rewards fetched!",
            data: user_reward_q.rows[0].rewards,
            success: true
        });

    } catch (error) {
        // If any error occurs, roll back the transaction
        await client.query('ROLLBACK');
        console.error("Error fetching user rewards:", error);

        // Return an error response
        return NextResponse.json({
            error: "Internal server error",
            success: false
        }, { status: 500 });
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
