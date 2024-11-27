import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Parse the request body
    const { resign_id, status} = await req.json();

    // Validate input
    if (!resign_id || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid input data." },
        { status: 400 }
      );
    }

    // Retrieve the resign agreement record
    const resignAgreementQuery = `
      SELECT * FROM resign_agreements r join company c on r.company_id = c.user_id WHERE resign_id = $1
    `;
    const resignAgreementResult = await pool.query(resignAgreementQuery, [resign_id]);

    if (resignAgreementResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Resign agreement not found." },
        { status: 404 }
      );
    }

    const { company_id , name } = resignAgreementResult.rows[0];

    // Start a transaction
    await pool.query("BEGIN");

    // Handle approval
    if (status === "approved") {
      
      const agreementText = `This agreement confirms that the company '${name}' agrees to the terms and conditions.`;
      // Create an agreement
      const agreementQuery = `
        INSERT INTO agreement (status,company_id , text)
        VALUES ('Accepted', $1 , $2)
        RETURNING *;
      `;
      const agreementValues = [company_id , agreementText];
      await pool.query(agreementQuery, agreementValues);

      // Create a notification for the approval
      const notificationQuery = `
        INSERT INTO notification (content)
        VALUES ($1) returning *;
      `;
      const notificationMessage = `Your resign agreement has been approved, and a new agreement has been created.`;
      const notificationResult = await pool.query(notificationQuery, [notificationMessage]);
      await pool.query('INSERT into notification_company (notification_id , company_id) values ($1 , $2)' , [notificationResult.rows[0].notification_id , company_id])
    }

    // Handle rejection
    if (status === "rejected") {
      // Create a notification for the rejection
      const notificationQuery = `
        INSERT INTO notification (content)
        VALUES ($1);
      `;
      const notificationMessage = `Your resign agreement has been rejected.`;
      const notificationResult = await pool.query(notificationQuery, [notificationMessage]);
      await pool.query('INSERT into notification_company (notification_id , company_id) values ($1 , $2)' , [notificationResult.rows[0].notification_id , company_id])
    }

    // Delete the resign agreement
    const deleteResignAgreementQuery = `
      DELETE FROM resign_agreements WHERE resign_id = $1;
    `;
    await pool.query(deleteResignAgreementQuery, [resign_id]);

    // Commit the transaction
    await pool.query("COMMIT");

    // Return success response
    return NextResponse.json(
      { success: true, message: `Resign agreement ${status} successfully.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating resign agreement status:", error);

    // Rollback transaction in case of an error
    await pool.query("ROLLBACK");

    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
