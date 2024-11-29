import { pool } from "@/database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  let companyId = parseInt(params.company_id);
  let all_trucks;

  console.log(companyId);

  const client = await pool.connect(); // Get a client for transaction management

  try {
    // Begin the transaction
    await client.query("BEGIN");

    all_trucks = await client.query(
      'SELECT trucks.truckid, trucks.licenseplate , trucks.capacity FROM trucks WHERE trucks.companyid = $1',
      [companyId]
    );

    if (all_trucks.rows.length === 0) {
      // If no trucks found, commit the transaction and return response
      await client.query("COMMIT");
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No trucks found for this company.',
      }, {
        status: 200,
      });
    }

    console.log(all_trucks.rows); // Log all the fetched trucks

    // Commit the transaction after fetching trucks
    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      data: all_trucks.rows,
      message: 'All trucks fetched successfully!',
    }, {
      status: 200,
    });

  } catch (error) {
    // In case of any error, rollback the transaction and log the error
    await client.query("ROLLBACK");
    console.error("Error fetching assigned trucks: ", error);

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch trucks.',
      error: error.message,
    }, {
      status: 500, // Internal Server Error
    });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}
