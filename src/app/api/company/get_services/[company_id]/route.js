import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { company_id } = await params;

  if (!company_id) {
    return NextResponse.json(
      { success: false, message: "Company ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      "SELECT service FROM Company_Services WHERE company_id = $1",
      [company_id]
    );

    const services = result.rows.map((row) => row.service);

    return NextResponse.json(
      { success: true, data: services },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching company services:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
