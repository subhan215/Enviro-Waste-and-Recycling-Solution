import { pool } from "../../../../../database/database";

export async function PATCH(req, { params }) {
  const { conversion_id } = params;

  try {
    const result = await pool.query(
      "UPDATE rewardconversions SET isseen = $1 WHERE conversion_id = $2",
      [true, conversion_id]
    );

    if (result.rowCount > 0) {
      return new Response(
        JSON.stringify({ success: true, message: "Marked as seen." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Request not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error updating isseen:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
