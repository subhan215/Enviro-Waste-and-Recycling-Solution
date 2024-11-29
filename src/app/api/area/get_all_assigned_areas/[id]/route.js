import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const client = await pool.connect(); // Start a new client connection to handle the transaction
  let companyId = parseInt(params.id);
  let all_areas;

  console.log("Company ID:", companyId);

  try {
    // Begin a transaction to ensure atomicity
    await client.query('BEGIN');

    // Fetch assigned areas for the given company
    all_areas = await client.query(
      'SELECT DISTINCT area.name, area.area_id, trucks.truckid, trucks.licenseplate FROM area LEFT JOIN trucks ON area.area_id = trucks.area_id WHERE area.company_id = $1',
      [companyId]
    );

    if (all_areas.rows.length === 0) {
      // Commit the transaction and return a response if no areas found
      await client.query('COMMIT');
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No assigned areas found for this company.',
      }, {
        status: 200,
      });
    }

    console.log(all_areas.rows); // Log all the fetched areas

    // Commit the transaction after successfully fetching the data
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: all_areas.rows,
      message: 'All assigned areas fetched successfully!',
    }, {
      status: 200,
    });

  } catch (error) {
    // Rollback the transaction if an error occurs
    await client.query('ROLLBACK');
    console.error("Error fetching assigned areas: ", error);

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch assigned areas.',
      error: error.message,
    }, {
      status: 500, // Internal Server Error
    });
  } finally {
    client.release(); // Release the client back to the pool
  }
}
