import { NextResponse } from "next/server";
import { pool } from "../../../../../database/database";

export async function DELETE(req, { params }) {
    const client = await pool.connect(); // Get a client for transaction management
    console.log(params);
    const { request_id } = params;

    try {
        // Begin a transaction to ensure atomicity
        await client.query("BEGIN");

        const deleteQuery = 'DELETE FROM request_for_waste WHERE request_id = $1';
        const result = await client.query(deleteQuery, [request_id]);
        console.log("Deleting successfully!", result);

        if (result.rowCount > 0) {
            // Commit the transaction after successful deletion
            await client.query("COMMIT");
            return NextResponse.json(
                { message: `Request with ID ${request_id} deleted successfully!`, success: true },
                { status: 200 }
            );
        } else {
            // Rollback if no rows were deleted (request not found)
            await client.query("ROLLBACK");
            return NextResponse.json(
                { message: `Request with ID ${request_id} not found!`, success: false },
                { status: 400 }
            );
        }
    } catch (error) {
        // Rollback in case of an error
        await client.query("ROLLBACK");
        console.error('Error deleting request:', error);
        return NextResponse.json(
            { message: `Some error occurred!`, success: false },
            { status: 505 }
        );
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
