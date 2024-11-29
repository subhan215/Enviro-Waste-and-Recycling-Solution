import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const client = await pool.connect(); // Get a client for transaction management

  try {
    // Begin transaction
    await client.query("BEGIN");

    const { user_id } = params;
    let userId = user_id;
    console.log(userId);

    // Validation: Ensure user_id is provided
    if (!userId) {
      // Rollback transaction if validation fails
      await client.query("ROLLBACK");
      return NextResponse.json(
        { success: false, message: "Missing user_id parameter." },
        { status: 400 }
      );
    }

    // Query the database for current transaction requests
    const result = await client.query(
      `SELECT * FROM RewardConversions WHERE user_id = $1 and (isseen = false or isseen is null)`,
      [userId]
    );

    // Commit transaction if everything is successful
    await client.query("COMMIT");

    // Return the transaction requests
    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    // Rollback transaction in case of an error
    await client.query("ROLLBACK");
    console.error("Error fetching current transaction requests:", error);

    // Return an error response
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
