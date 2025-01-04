import { NextResponse } from "next/server";
import { pool } from "../../../../database/database";

export async function GET() {
  try {
    // Begin transaction
    await pool.query("BEGIN");

    // Basic query to fetch reward conversion data
    const query = `
      SELECT * 
      FROM RewardConversions rC 
      JOIN "User" u ON u.user_id = rC.user_id 
      WHERE status = $1 
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, ['Pending']);

    // Commit transaction
    await pool.query("COMMIT");

    // Return the response with the fetched data
    return NextResponse.json(
      {
        success: true,
        data: result.rows,
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    // Rollback transaction in case of an error
    await pool.query("ROLLBACK");

    console.error("Error fetching reward conversion requests:", err);

    // Return an error response
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reward conversion requests",
      },
      {
        status: 500,
      }
    );
  }
}
