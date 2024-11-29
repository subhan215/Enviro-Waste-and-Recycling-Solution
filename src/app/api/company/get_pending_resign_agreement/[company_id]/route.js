import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const client = await pool.connect(); // Create a client for transaction handling

  try {
    const { company_id } = params;

    if (!company_id) {
      return NextResponse.json(
        { success: false, message: "Missing company_id parameter." },
        { status: 400 }
      );
    }

    // Begin the transaction
    await client.query('BEGIN');

    // Query to get pending resign agreements for a specific company
    const query = `
      SELECT resign_id, company_id, created_at 
      FROM resign_agreements 
      WHERE status = 'pending' AND company_id = $1;
    `;
    const values = [company_id];
    const result = await client.query(query, values);

    // Commit the transaction if everything went fine
    await client.query('COMMIT');

    // Return the list of pending resign agreements for the company
    return NextResponse.json({
      success: true,
      message: "Pending resign agreements retrieved successfully.",
      data: result.rows, // Adjusted to return all matching rows
    });

  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error("Error fetching pending resign agreements:", error);

    // Return an error response
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
