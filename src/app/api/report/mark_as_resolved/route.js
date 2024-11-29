import { NextResponse } from "next/server";
import { pool } from "../../../../database/database";

export async function POST(req) {
  const client = await pool.connect(); // Get a client for transaction management

  try {
    const { report_id } = await req.json();

    console.log("Report ID received at backend:", report_id);

    // Begin the transaction
    await client.query('BEGIN');

    // Update the status of the report to resolved
    const mark_as_resolved = await client.query(
      `UPDATE reports 
       SET status = true, message = 'Your complaint has been resolved'
       WHERE report_id = $1 
       RETURNING *`,
      [report_id]
    );

    // Commit the transaction
    await client.query('COMMIT');

    if (mark_as_resolved.rowCount === 0) {
      return NextResponse.json({
        message: "Report not found or already resolved",
        success: false,
      });
    }

    console.log("Updated Report Data:", mark_as_resolved.rows[0]);

    return NextResponse.json({
      message: "Report marked as resolved successfully",
      data: mark_as_resolved.rows[0],
      success: true,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error("Error marking report as resolved:", error);
    return NextResponse.json({
      message: "Failed to mark report as resolved",
      success: false,
    });
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
