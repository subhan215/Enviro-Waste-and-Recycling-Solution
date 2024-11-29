import { pool } from "@/database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const client = await pool.connect(); // Get a client for transaction management

    try {
        const { user_id } = params;
        const userId = user_id;
        console.log(userId);

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Begin transaction
        await client.query("BEGIN");

        // Query the database for all requests by the user
        const result = await client.query(
            `SELECT request_id, user_id, weight, latitude, longitude, date, time, offered_price
             FROM request_for_waste WHERE user_id = $1`,
            [userId]
        );
        console.log(result.rows);

        if (result.rowCount === 0) {
            // Rollback transaction if no requests found
            await client.query("ROLLBACK");
            return NextResponse.json(
                { message: "No requests found for this user" },
                { status: 404 }
            );
        }

        // Commit the transaction if everything is successful
        await client.query("COMMIT");

        // Respond with the user's requests
        return NextResponse.json(
            { requests: result.rows },
            { status: 200 }
        );
    } catch (error) {
        // Rollback the transaction in case of an error
        await client.query("ROLLBACK");
        console.error("Error fetching requests:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
