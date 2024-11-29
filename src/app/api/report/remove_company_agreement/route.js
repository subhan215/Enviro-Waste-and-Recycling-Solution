import { NextResponse } from "next/server";
import { pool } from "../../../../database/database";

export async function POST(req) {
  const client = await pool.connect(); // Get a client for transaction management

  try {
    const { company_id } = await req.json();

    // Start a transaction to ensure atomicity
    await client.query("BEGIN");

    // Delete the company's agreement record
    const deleteAgreement = await client.query(
      `DELETE FROM Agreement WHERE company_id = $1`,
      [company_id]
    );

    if (deleteAgreement.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message: "No agreement found for the specified company.",
          success: false,
        },
        { status: 404 }
      );
    }

    // Update the Reports entity with the new status message
    const updateReports = await client.query(
      `UPDATE reports
       SET message = 'A new company will soon be assigned to your area' , status = false
       WHERE company_id = $1`,
      [company_id]
    );

    if (updateReports.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message: "Agreement removed, but no matching report found to update.",
          success: false,
        },
        { status: 404 }
      );
    }

    // 1. Update the Area table: Set company_id to NULL
    await client.query(
      `UPDATE area SET company_id = NULL WHERE company_id = $1`,
      [company_id]
    );

    // 2. Delete all schedules related to the company
    await client.query(`DELETE FROM schedule WHERE company_id = $1`, [
      company_id,
    ]);

    // 3. Delete all chats related to the company
    const chatRecords = await client.query(
      `SELECT chat_id FROM chat WHERE company_id = $1`,
      [company_id]
    );

    const chatIds = chatRecords.rows.map((row) => row.chat_id);
    if (chatIds.length > 0) {
      // Delete related messages first
      await client.query(
        `DELETE FROM message WHERE chat_id = ANY($1::int[])`,
        [chatIds]
      );
      // Delete chats
      await client.query(`DELETE FROM chat WHERE company_id = $1`, [
        company_id,
      ]);
    }

    // 4. Delete missed pickups related to the company
    await client.query(`DELETE FROM missed_pickup WHERE company_id = $1`, [
      company_id,
    ]);

    // 5. Delete request_for_area_approval records related to the company
    await client.query(
      `DELETE FROM request_for_area_approval WHERE company_id = $1`,
      [company_id]
    );

    // 6. Update request_for_waste table: Set company_id to NULL and offered_price to 0
    await client.query(
      `UPDATE request_for_waste SET offered_by = NULL, offered_price = 0 WHERE offered_by = $1`,
      [company_id]
    );

    // Commit the transaction
    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Agreement removed successfully, and related records updated.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    // Rollback in case of an error
    await client.query("ROLLBACK");
    console.error("Error while processing request:", error);

    return NextResponse.json(
      {
        message: "Internal server error.",
        success: false,
      },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
