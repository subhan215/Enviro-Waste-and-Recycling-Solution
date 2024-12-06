import { NextResponse } from "next/server";
import { pool } from "../../../../../database/database";
export async function GET(req , {params}) {
  const {companyId} = params // Get companyId from query parameters

  if (!companyId) {
    return new NextResponse(
      JSON.stringify({ error: "Company ID is required" }),
      { status: 400 }
    );
  }

  try {
    // Query to fetch requests by company_id
    const query = `
      SELECT *
      FROM request_submit_material
      WHERE company_id = $1;
    `;
    const { rows } = await pool.query(query, [companyId]);

    // Respond with the retrieved requests
    return new NextResponse(
      JSON.stringify({
        message: "Requests retrieved successfully",
        data: rows,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching requests:", error);

    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
