import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
  // Create a client for transaction handling
  const client = await pool.connect();

  try {
    // Begin transaction to ensure atomic operations
    await client.query('BEGIN');

    // Parse JSON body
    const body = await req.json();
    const { company_id } = body;

    // Validate required fields
    if (!company_id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 } // Bad request if company_id is missing
      );
    }

    // Insert into the database
    const query = `
      INSERT INTO resign_agreements (company_id)
      VALUES ($1)
      RETURNING *;
    `;
    const values = [company_id];
    const result = await client.query(query, values);

    // Commit the transaction after the successful insert
    await client.query('COMMIT');

    // Success response: returning the inserted data
    return NextResponse.json(
      {
        success: true,
        message: "Re-sign request submitted successfully.",
        data: result.rows[0], // Return the inserted row
      },
      { status: 201 } // Created status code
    );
  } catch (error) {
    // If an error occurs, rollback the transaction
    await client.query('ROLLBACK');
    console.error("Error submitting re-sign agreement request:", error);

    // Error response: something went wrong during the transaction
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 } // Internal server error status code
    );
  } finally {
    // Release the client back to the pool after use
    client.release();
  }
}
