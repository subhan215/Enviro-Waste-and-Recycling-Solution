import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
    const client = await pool.connect(); // Get a client for transaction management

    try {
        // Parse the request body
        let { waste, preferredDate, preferredTime, latitude, longitude, userId } = await req.json();

        console.log("User id : ", userId);

        // Validate the input data
        if (!waste || !preferredDate || !preferredTime || !latitude || !longitude || !userId) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Begin a transaction to ensure atomicity
        await client.query("BEGIN");

        // Check if a request already exists for the user
        const existingRequest = await client.query(
            `SELECT request_id FROM request_for_waste WHERE user_id = $1`,
            [userId]
        );

        if (existingRequest.rowCount > 0) {
            // Rollback the transaction if a request already exists for the user
            await client.query("ROLLBACK");
            return NextResponse.json(
                { message: "User already has an existing request", success: false },
                { status: 400 }
            );
        }

        // Insert the data into the database
        const result = await client.query(
            `INSERT INTO request_for_waste (user_id, weight, latitude, longitude, date, time) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING request_id`,
            [userId, waste, latitude, longitude, preferredDate, preferredTime]
        );

        // Commit the transaction
        await client.query("COMMIT");

        // Respond with success and the created request ID
        return NextResponse.json(
            { message: "Request created successfully", requestId: result.rows[0].request_id, success: true },
            { status: 201 }
        );
    } catch (error) {
        // Rollback in case of an error
        await client.query("ROLLBACK");
        console.error("Error inserting data:", error);

        // Return error response
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
