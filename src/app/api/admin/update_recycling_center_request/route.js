import {pool} from "../../../../database/database" ; 
import { NextResponse } from "next/server";

export async function PUT(req) {
    console.log("Update Recycling Center Request API called");

    const client = await pool.connect(); // Database connection
    try {
        const { request_id, status } = await req.json();
        console.log(request_id , status)
        // Validate input
        if (!request_id || !status) {
            return NextResponse.json(
                { success: false, message: "Request ID and status are required." },
                { status: 400 }
            );
        }

        // Begin transaction
        await client.query("BEGIN");

        // Fetch the request details
        const requestResult = await client.query(
            `SELECT * FROM request_recycling_center WHERE request_id = $1`,
            [request_id]
        );

        if (requestResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return NextResponse.json(
                { success: false, message: "Request not found." },
                { status: 404 }
            );
        }

        const request = requestResult.rows[0];

        if (status === "Approved") {
            // Create a recycling center
            await client.query(
                `INSERT INTO recycling_center (company_id, latitude, longitude) VALUES ($1, $2, $3)`,
                [request.company_id, request.latitude, request.longitude]
            );

            // Create a notification for the company
            const notificationCompany = await client.query(
                `INSERT INTO notification (content, created_at) VALUES ($1, NOW()) RETURNING *`,
                ["Your request for a recycling center has been accepted."]
            );

            if (notificationCompany.rows.length === 0) {
                throw new Error("Failed to create notification for approved request.");
            }

            // Link the notification to the company
            await client.query(
                `INSERT INTO notification_company (company_id, notification_id) VALUES ($1, $2)`,
                [request.company_id, notificationCompany.rows[0].notification_id]
            );

        } else if (status === "Rejected") {
            // Create a rejection notification for the company
            const notificationCompany = await client.query(
                `INSERT INTO notification (content, created_at) VALUES ($1, NOW()) RETURNING *`,
                ["Your request for a recycling center has been rejected."]
            );

            if (notificationCompany.rows.length === 0) {
                throw new Error("Failed to create notification for rejected request.");
            }

            // Link the rejection notification to the company
            await client.query(
                `INSERT INTO notification_company (company_id, notification_id) VALUES ($1, $2)`,
                [request.company_id, notificationCompany.rows[0].notification_id]
            );

        } else {
            await client.query("ROLLBACK");
            return NextResponse.json(
                { success: false, message: "Invalid status value." },
                { status: 400 }
            );
        }

        // Delete the request from the `request_recycling_center` table
        await client.query(
            `DELETE FROM request_recycling_center WHERE request_id = $1`,
            [request_id]
        );

        // Commit transaction
        await client.query("COMMIT");

        return NextResponse.json(
            { success: true, message: "Request processed successfully." },
            { status: 200 }
        );
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error processing recycling center request:", error);
        return NextResponse.json(
            { success: false, message: "Error processing request." },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
