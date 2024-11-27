import { pool } from "../../../../database/database";

export async function POST(req) {
  try {
    const { company_id } = await req.json();

    // Start a transaction to ensure atomicity
    await pool.query("BEGIN");

    // Delete the company's agreement record
    const deleteAgreement = await pool.query(
      `DELETE FROM Agreement WHERE company_id = $1`,
      [company_id]
    );

    if (deleteAgreement.rowCount === 0) {
      await pool.query("ROLLBACK");
      return new Response(
        JSON.stringify({
          message: "No agreement found for the specified company.",
          success: false,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update the Reports entity with the new status message
    const updateReports = await pool.query(
      `UPDATE reports
       SET message = 'A new company will soon be assigned to your area' , status = false
       WHERE company_id = $1`,
      [company_id]
    );

    if (updateReports.rowCount === 0) {
      await pool.query("ROLLBACK");
      return new Response(
        JSON.stringify({
          message: "Agreement removed, but no matching report found to update.",
          success: false,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Update the Area table: Set company_id to NULL
    await pool.query(
      `UPDATE area SET company_id = NULL WHERE company_id = $1`,
      [company_id]
    );

    // 2. Delete all schedules related to the company
    await pool.query(`DELETE FROM schedule WHERE company_id = $1`, [company_id]);

    // 3. Delete all chats related to the company
    const chatRecords = await pool.query(
      `SELECT chat_id FROM chat WHERE company_id = $1`,
      [company_id]
    );

    const chatIds = chatRecords.rows.map(row => row.chat_id);
    if (chatIds.length > 0) {
      // Delete related messages first
      await pool.query(
        `DELETE FROM message WHERE chat_id = ANY($1::int[])`,
        [chatIds]
      );
      // Delete chats
      await pool.query(`DELETE FROM chat WHERE company_id = $1`, [company_id]);
    }

    // 4. Delete missed pickups related to the company
    await pool.query(`DELETE FROM missed_pickup WHERE company_id = $1`, [company_id]);

    // 5. Delete request_for_area_approval records related to the company
    await pool.query(
      `DELETE FROM request_for_area_approval WHERE company_id = $1`,
      [company_id]
    );

    // 6. Update request_for_waste table: Set company_id to NULL and offered_price to 0
    await pool.query(
      `UPDATE request_for_waste SET offered_by = NULL, offered_price = 0 WHERE offered_by = $1`,
      [company_id]
    );

    // Commit the transaction
    await pool.query("COMMIT");

    return new Response(
      JSON.stringify({
        message: "Agreement removed successfully, and related records updated.",
        success: true,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error while processing request:", error);

    // Rollback in case of an error
    await pool.query("ROLLBACK");

    return new Response(
      JSON.stringify({
        message: "Internal server error.",
        success: false,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
