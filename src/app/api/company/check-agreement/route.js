import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
  const client = await pool.connect(); // Create a client for transaction handling

  try {
    // Begin the transaction
    await client.query('BEGIN');

    const { company_id } = await req.json();

    // Input validation
    if (!company_id) {
      await client.query('ROLLBACK'); // Rollback if company_id is not provided
      return NextResponse.json({ success: false, message: "company_id is required." }, { status: 400 });
    }

    // Query to check if the agreement exists
    const agreementQuery = await client.query(
      `SELECT * FROM Agreement WHERE company_id = $1`,
      [company_id]
    );

    console.log(agreementQuery);

    // If an agreement exists, return success response with agreement status
    if (agreementQuery.rows.length > 0) {
      await client.query('COMMIT'); // Commit the transaction if everything is successful
      return NextResponse.json(
        { success: true, agreementExists: true },
        { status: 200 }
      );
    } else {
      await client.query('COMMIT'); // Commit the transaction if no agreement exists
      return NextResponse.json(
        { success: true, agreementExists: false },
        { status: 200 }
      );
    }
  } catch (error) {
    // Rollback the transaction in case of any error
    await client.query('ROLLBACK');
    console.error("Error checking agreement:", error);
    return NextResponse.json(
      { success: false, message: "Error checking agreement." },
      { status: 500 }
    );
  } finally {
    client.release(); // Release the client back to the pool
  }
}
