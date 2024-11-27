import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Parse JSON body
    const body = await req.json();
    const { company_id } = body;

    // Validate required fields
    if (!company_id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert into the database
    const query = `
      INSERT INTO resign_agreements (company_id)
      VALUES ($1)
      RETURNING *;
    `;
    const values = [company_id];
    const result = await pool.query(query, values);

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: "Re-sign request submitted successfully.",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting re-sign agreement request:", error);
    // Error response
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
