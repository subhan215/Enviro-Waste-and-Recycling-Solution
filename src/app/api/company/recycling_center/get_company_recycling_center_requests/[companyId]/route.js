import { pool } from "../../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req , {params}) {
    console.log("Fetch Recycling Center requests received");

    const client = await pool.connect();
    try {
        // Extract company_id from the query parameters
        const {companyId} = params ; 
        const company_id = companyId ; 

        if (isNaN(company_id)) {
            return NextResponse.json(
                { success: false, message: "Invalid company_id." },
                { status: 400 }
            );
        }

        // Query the database to fetch the recycling center requests
        const result = await client.query(
            `SELECT * FROM request_recycling_center WHERE company_id = $1`,
            [company_id]
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
