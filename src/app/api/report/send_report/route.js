import { NextResponse } from "next/server";
import { pool } from "../../../../database/database";
import * as geminiAi from "@/utils/geminiAi";

export async function POST(req) {
    const client = await pool.connect(); // Get a client for transaction management

    let { user_id, company_id, description } = await req.json();
    console.log(user_id, company_id, description);

    try {
        // Begin a transaction to ensure atomicity
        await client.query("BEGIN");

        // Perform sentiment analysis
        const sentiment = await geminiAi.sentiment_analysis(description);
        console.log("Sentiment:", sentiment);

        // Insert the new report into the reports table
        const inserting_to_reports = await client.query(
            `INSERT INTO reports (user_id, company_id, description, sentiment_rating) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [user_id, company_id, description, parseInt(sentiment)]
        );

        console.log("Inserted Report:", inserting_to_reports.rows[0]);

        // Fetch the report with the associated company details
        const joined_report_query = await client.query(
            `SELECT r.*, 
                    c.name,
                    c.email_id, 
                    c.phone
             FROM reports r
             INNER JOIN company c ON r.company_id = c.user_id
             WHERE r.report_id = $1 
             ORDER BY report_id DESC`,
            [inserting_to_reports.rows[0].report_id]
        );

        console.log("Joined Report Data:", joined_report_query.rows[0]);

        // Commit the transaction
        await client.query("COMMIT");

        // Return the response with joined data
        return NextResponse.json({
            message: "Inserted to reports with company details",
            data: joined_report_query.rows[0],
            success: true,
        });

    } catch (error) {
        // Rollback in case of an error
        await client.query("ROLLBACK");
        console.error("Error inserting report:", error);

        // Handle errors gracefully
        return NextResponse.json({
            message: "Failed to insert report",
            success: false,
        });
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
