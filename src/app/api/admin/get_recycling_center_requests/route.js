import { pool } from ".././../../../database/database";
import { NextResponse } from "next/server";

export async function GET() {
    console.log("Fetching all recycling center requests...");

    const client = await pool.connect();
    try {
        // Fetch all recycling center requests with company name
        const result = await client.query(
            `SELECT rrc.*, c.name as company_name, c.name as name
             FROM request_recycling_center rrc
             JOIN company c ON rrc.company_id = c.user_id
             WHERE rrc.status = 'Pending' OR rrc.status IS NULL
             ORDER BY rrc.request_id DESC`
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
