import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
  const client = await pool.connect(); // Acquire a client from the pool
  try {
    // Parse the request body
    const { resign_id, status } = await req.json();

    // Validate input
    if (!resign_id || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid input data." },
        { status: 400 }
      );
    }

    // Start a transaction
    await client.query("BEGIN");

    // Retrieve the resign agreement record
    const resignAgreementQuery = `
      SELECT * FROM resign_agreements r 
      JOIN company c ON r.company_id = c.user_id 
      WHERE resign_id = $1
    `;
    const resignAgreementResult = await client.query(resignAgreementQuery, [resign_id]);

    if (resignAgreementResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { success: false, message: "Resign agreement not found." },
        { status: 404 }
      );
    }

    const { company_id, name } = resignAgreementResult.rows[0];

    // Handle approval
    if (status === "approved") {
      const agreementText = `This agreement confirms that the company '${name}' agrees to the terms and conditions.`;

      // Create an agreement
      const agreementQuery = `
        INSERT INTO agreement (status, company_id, text)
        VALUES ('Accepted', $1, $2)
        RETURNING *;
      `;
      const agreementValues = [company_id, agreementText];
      await client.query(agreementQuery, agreementValues);

      // Create a notification for the approval
      const notificationQuery = `
        INSERT INTO notification (content)
        VALUES ($1)
        RETURNING *;
      `;
      const notificationMessage = `Your resign agreement has been approved, and a new agreement has been created.`;
      const notificationResult = await client.query(notificationQuery, [notificationMessage]);
      await client.query(
        'INSERT INTO notification_company (notification_id, company_id) VALUES ($1, $2)',
        [notificationResult.rows[0].notification_id, company_id]
      );
    }

    // Handle rejection
    if (status === "rejected") {
      // Create a notification for the rejection
      const notificationQuery = `
        INSERT INTO notification (content)
        VALUES ($1)
        RETURNING *;
      `;
      const notificationMessage = `Your resign agreement has been rejected.`;
      const notificationResult = await client.query(notificationQuery, [notificationMessage]);
      await client.query(
        'INSERT INTO notification_company (notification_id, company_id) VALUES ($1, $2)',
        [notificationResult.rows[0].notification_id, company_id]
      );
    }

    // Delete the resign agreement
    const deleteResignAgreementQuery = `
      DELETE FROM resign_agreements WHERE resign_id = $1;
    `;
    await client.query(deleteResignAgreementQuery, [resign_id]);

    // Commit the transaction
    await client.query("COMMIT");

    // Return success response
    return NextResponse.json(
      { success: true, message: `Resign agreement ${status} successfully.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating resign agreement status:", error);

    // Rollback transaction in case of an error
    await client.query("ROLLBACK");

    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  } finally {
    client.release(); // Release the client back to the pool
  }
}
