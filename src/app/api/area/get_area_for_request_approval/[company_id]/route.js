import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const client = await pool.connect(); // Start a new client connection for transaction handling
  try {
    // Extract company_id from the query parameters
    const { company_id } = params;

    if (!company_id) {
      return NextResponse.json({
        success: false,
        message: 'company_id is required.',
      }, {
        status: 400
      });
    }

    // Begin the transaction
    await client.query('BEGIN');

    // Query to fetch requests for the specific company
    const result = await client.query(
      `SELECT area_approval_id, request_for_area_approval.area_id, request_for_area_approval.company_id, status, name
       FROM request_for_area_approval 
       JOIN area ON request_for_area_approval.area_id = area.area_id
       WHERE request_for_area_approval.company_id = $1`,
      [company_id]
    );

    // Commit the transaction
    await client.query('COMMIT');

    // Return the fetched data as a JSON response
    return NextResponse.json({
      success: true,
      data: result.rows,
      message: 'Requests fetched successfully!',
    }, {
      status: 200
    });

  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');
    console.error("Error fetching requests for area approval: ", error);

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch requests for area approval.',
      error: error.message,
    }, {
      status: 500
    });

  } finally {
    client.release(); // Release the client back to the pool
  }
}
