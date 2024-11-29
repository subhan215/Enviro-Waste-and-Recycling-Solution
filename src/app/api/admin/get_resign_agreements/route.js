import { NextResponse } from "next/server";
import { pool } from "../../../../database/database";

export async function GET() {
  try {
    // Begin transaction
    await pool.query("BEGIN");

    // Query to fetch all agreements
    const query = `
      SELECT * FROM resign_agreements r join company c on r.company_id = c.user_id
      ORDER BY created_at ASC;
    `;

    const result = await pool.query(query);

    // Commit transaction
    await pool.query("COMMIT");

    // Return the agreements as a JSON response
    return NextResponse.json(
      {
        success: true,
        message: "Agreements fetched successfully.",
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    // Rollback transaction in case of an error
    await pool.query("ROLLBACK");
    console.error("Error fetching agreements:", error);
    // Error response
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}