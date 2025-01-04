import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function GET() {
    const client = await pool.connect(); // Get a client for transaction management

    try {
        // Begin a transaction to ensure atomicity
        await client.query("BEGIN");

        const requestQuery = `
            SELECT name, rate_per_kg
            FROM recycling_categories
        `;
        
        const { rows } = await client.query(requestQuery);  // Execute query using the client
        console.log(rows);

        // Commit the transaction
        await client.query("COMMIT");

        // Return success response
        return NextResponse.json({
            message: "Waste prices fetched!",
            data: rows,
            success: true
        });

    } catch (error) {
        // Rollback in case of an error
        await client.query("ROLLBACK");
        console.log("Error in getting waste prices! error: ", error);

        // Return error response
        return NextResponse.json({
            message: "Error in getting waste prices",
            success: false
        });
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
