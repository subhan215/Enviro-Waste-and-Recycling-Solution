import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const client = await pool.connect(); // Start a new client connection for transaction handling
  try {
    console.log("Route hit!", params.id);

    const companyId = parseInt(params.id); // Convert params.id to an integer
    if (isNaN(companyId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid company ID provided.',
      }, {
        status: 400, // Bad request for invalid company ID
      });
    }

    // Begin the transaction
    await client.query('BEGIN');

    // Query to fetch non-assigned truck areas for the given company
    const result = await client.query(
      'SELECT area.area_id, area.name FROM area LEFT JOIN trucks ON area.area_id = trucks.area_id WHERE area.company_id = $1::integer AND truckid IS NULL',
      [companyId]
    );

    // Commit the transaction
    await client.query('COMMIT');

    // Return the fetched data as a JSON response
    return NextResponse.json({
      success: true,
      data: result.rows,
      message: 'All non-assigned truck areas fetched!',
    }, {
      status: 200,
    });

  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');
    console.error("Error fetching non-assigned truck areas: ", error);

    return NextResponse.json({
      success: false,
      message: 'Error fetching areas.',
      error: error.message,
    }, {
      status: 500, // Internal Server Error
    });

  } finally {
    client.release(); // Release the client back to the pool
  }
}
