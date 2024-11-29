import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await pool.connect(); // Start a new client connection to handle the transaction
  let all_areas;

  try {
    // Begin a transaction to ensure atomicity
    await client.query('BEGIN');

    // Fetch non-served areas where company_id is null
    all_areas = await client.query('SELECT * FROM area WHERE company_id IS NULL');
    console.log(all_areas.rows);

    // Commit the transaction after successfully fetching the data
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: all_areas.rows,
      message: 'All non-served areas fetched!',
    }, {
      status: 200,
    });

  } catch (error) {
    // Rollback the transaction if an error occurs
    await client.query('ROLLBACK');
    console.error("Error fetching non-served areas: ", error);

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch non-served areas.',
      error: error.message,
    }, {
      status: 500, // Internal Server Error
    });
  } finally {
    client.release(); // Release the client back to the pool
  }
}
