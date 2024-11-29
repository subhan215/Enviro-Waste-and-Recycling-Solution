import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const client = await pool.connect(); // Get a client for transaction management

  try {
    const { conversion_id } = params;

    // Begin transaction
    await client.query("BEGIN");

    // Update the 'isseen' field in the database
    const result = await client.query(
      "UPDATE rewardconversions SET isseen = $1 WHERE conversion_id = $2",
      [true, conversion_id]
    );

    // Commit transaction if the update was successful
    await client.query("COMMIT");

    if (result.rowCount > 0) {
      // Return success response if the request was found and updated
      return NextResponse.json(
        { success: true, message: "Marked as seen." },
        { status: 200 }
      );
    } else {
      // Return error response if no matching request was found
      return NextResponse.json(
        { success: false, message: "Request not found." },
        { status: 404 }
      );
    }
  } catch (error) {
    // Rollback transaction in case of an error
    await client.query("ROLLBACK");

    console.error("Error updating isseen:", error);

    // Return error response if there was a problem with the database operation
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
