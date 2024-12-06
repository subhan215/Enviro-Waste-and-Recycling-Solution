import { pool } from ".././../../../database/database";
import { NextResponse } from "next/server";

export async function GET() {
    console.log("Fetching all recycling center requests...");

    const client = await pool.connect();
    try {
        // Fetch all recycling center requests from the database
        const result = await client.query(
            `SELECT * FROM request_recycling_center`
        );

        // Return the fetched results
        return NextResponse.json(
            { success: true, data: result.rows },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching recycling center requests:", error);
        return NextResponse.json(
            { success: false, message: `Error: ${error.message}` },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
