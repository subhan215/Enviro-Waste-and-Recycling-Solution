import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { service_type } = await params;

  // Validate service type
  const validServiceTypes = ['waste_collection', 'manhole_management', 'recycling'];
  if (!validServiceTypes.includes(service_type)) {
    return NextResponse.json({
      success: false,
      message: 'Invalid service type',
    }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if area_service_assignment table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'area_service_assignment'
      )
    `);

    let all_areas;

    if (tableCheck.rows[0].exists) {
      // Get all areas that don't have this service type assigned yet
      all_areas = await client.query(
        `SELECT a.area_id, a.name
         FROM area a
         WHERE a.area_id NOT IN (
           SELECT asa.area_id
           FROM area_service_assignment asa
           WHERE asa.service_type = $1
         )
         ORDER BY a.name`,
        [service_type]
      );
    } else {
      // Table doesn't exist - for waste_collection use legacy check,
      // for other services return all areas
      if (service_type === 'waste_collection') {
        all_areas = await client.query(
          `SELECT area_id, name FROM area WHERE company_id IS NULL ORDER BY name`
        );
      } else {
        // For manhole_management and recycling, return all areas
        all_areas = await client.query(
          `SELECT area_id, name FROM area ORDER BY name`
        );
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: all_areas.rows,
      message: `Available areas for ${service_type} fetched!`,
    }, { status: 200 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error fetching available areas: ", error);

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch available areas.',
      error: error.message,
    }, { status: 500 });
  } finally {
    client.release();
  }
}
