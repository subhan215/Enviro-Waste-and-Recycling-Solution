import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;
  const client = await pool.connect();
  let companyId = parseInt(id);

  console.log("Company ID:", companyId);

  try {
    await client.query('BEGIN');

    // Fetch assigned areas from area_service_assignment table (includes all service types)
    // Also include legacy areas from area.company_id for backward compatibility
    const all_areas = await client.query(
      `SELECT DISTINCT
        a.name,
        a.area_id,
        t.truckid,
        t.licenseplate,
        COALESCE(asa.service_type, 'waste_collection') as service_type
      FROM area a
      LEFT JOIN trucks t ON a.area_id = t.area_id AND t.companyid = $1
      LEFT JOIN area_service_assignment asa ON a.area_id = asa.area_id AND asa.company_id = $1
      WHERE a.company_id = $1 OR asa.company_id = $1
      ORDER BY a.name`,
      [companyId]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: all_areas.rows,
      message: all_areas.rows.length > 0
        ? 'All assigned areas fetched successfully!'
        : 'No assigned areas found for this company.',
    }, {
      status: 200,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error fetching assigned areas: ", error);

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch assigned areas.',
      error: error.message,
    }, {
      status: 500,
    });
  } finally {
    client.release();
  }
}
