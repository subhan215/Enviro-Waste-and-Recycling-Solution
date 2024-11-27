import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { company_id } = params;

  if (!company_id) {
    return NextResponse.json(
      { success: false, message: "Missing company_id parameter." },
      { status: 400 }
    );
  }

  try {
    // Query to get pending resign agreements for a specific company
    const query = `
      SELECT resign_id, company_id, created_at 
      FROM resign_agreements 
      WHERE status = 'pending' AND company_id = $1;
    `;
    const values = [company_id];
    const result = await pool.query(query, values);

    // Return the list of pending resign agreements for the company
    return NextResponse.json({
      success: true,
      message: "Pending resign agreements retrieved successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching pending resign agreements:", error);

    // Return an error response
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
