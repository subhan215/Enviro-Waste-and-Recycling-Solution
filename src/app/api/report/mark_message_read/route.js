import { NextResponse } from "next/server";
import { pool } from "../../../../database/database";

export async function POST(req) {
  const client = await pool.connect(); // Get a client for transaction management

  try {
    const body = await req.json();
    const { report_id } = body;

    if (!report_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Report ID is required",
            code: "VALIDATION_ERROR",
          },
        },
        { status: 400 }
      );
    }

    // Begin the transaction
    await client.query("BEGIN");

    // Check if the report exists
    const reportResult = await client.query(
      "SELECT * FROM reports WHERE report_id = $1",
      [report_id]
    );

    if (reportResult.rowCount === 0) {
      await client.query("ROLLBACK"); // Rollback the transaction if report not found
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Report not found",
            code: "NOT_FOUND",
          },
        },
        { status: 404 }
      );
    }

    // Update the message_read status
    const updateResult = await client.query(
      "UPDATE reports SET status = true WHERE report_id = $1 RETURNING *",
      [report_id]
    );

    // Commit the transaction
    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        data: {
          report: updateResult.rows[0],
        },
        message: "Message marked as read successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query("ROLLBACK");
    console.error("Error in mark_message_read:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
