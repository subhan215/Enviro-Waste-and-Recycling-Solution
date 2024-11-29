import { pool } from "@/database/database";
import { NextResponse } from "next/server";

export async function PUT(req) {
    const client = await pool.connect(); // Get a client for transaction management

    try {
        const { requestId, newPrice, company_id } = await req.json();
        const price = newPrice;
        console.log(price, requestId, company_id); 
        
        // Input validation
        if (!requestId || !price || !company_id) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        // Begin a transaction to ensure atomicity
        await client.query("BEGIN");

        // Update the offered price in the database
        const updateQuery = `
            UPDATE request_for_waste
            SET offered_price = $1, offered_by = $2
            WHERE request_id = $3
            RETURNING request_id, offered_price, offered_by;
        `;

        const result = await client.query(updateQuery, [price, company_id, requestId]);

        if (result.rowCount === 0) {
            // Rollback if no rows were updated
            await client.query("ROLLBACK");
            return NextResponse.json(
                { message: "Request not found or update failed", success: false },
                { status: 404 }
            );
        }

        // Commit the transaction
        await client.query("COMMIT");

        // Return success response
        return NextResponse.json(
            { success: true, data: result.rows[0] },
            { status: 200 }
        );

    } catch (error) {
        // Rollback in case of an error
        await client.query("ROLLBACK");
        console.error("Error updating offered price:", error);

        // Return error response
        return NextResponse.json(
            { message: "Internal Server Error", success: false },
            { status: 500 }
        );
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
