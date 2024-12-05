import { pool } from "../../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  let companyId = parseInt(params.company_id);
  let all_centers;
  
  console.log("company id:", companyId);

  // Create a client for transaction handling
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');
    
    all_centers = await client.query(
      'SELECT * from recycling_center where recycling_center.company_id = $1',
      [companyId]
    );

    if (all_centers.rows.length === 0) {
      // Rollback transaction if no centers are found
      await client.query('ROLLBACK');
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No recycling center found for the company.',
      }, { status: 200 });
    }

    console.log(all_centers.rows); // Log all the fetched areas

    // Commit transaction after successful fetch
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: all_centers.rows,
      message: 'All recycling centers fetched successfully!',
    }, { status: 200 });

  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error("Error fetching recycling centers:", error);

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch recycling centers.',
      error: error.message,
    }, { status: 500 });
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
