import {pool} from "../../../../database/database"
export async function POST(req) {
  try {
    const body = await req.json();
    const { report_id } = body;

    if (!report_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Report ID is required",
            code: "VALIDATION_ERROR",
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the report exists
    const reportResult = await pool.query(
      "SELECT * FROM reports WHERE report_id = $1",
      [report_id]
    );

    if (reportResult.rowCount === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Report not found",
            code: "NOT_FOUND",
          },
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update the message_read status
    const updateResult = await pool.query(
      "UPDATE reports SET status = true WHERE report_id = $1 RETURNING *",
      [report_id]
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          report: updateResult.rows[0],
        },
        message: "Message marked as read successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in mark_message_read:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
