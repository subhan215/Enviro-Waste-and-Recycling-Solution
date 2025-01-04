import { NextResponse } from "next/server";
import { pool } from "../../../../database/database"; // Import the database pool
export async function GET() {
  const client = await pool.connect(); // Get a client from the pool
  try {
    // Query the database to get all records from the request_submit_material table
    const result = await client.query('SELECT * FROM request_submit_material');

    // Respond with the retrieved data
    return new NextResponse(
      JSON.stringify({
        message: "Request data retrieved successfully",
        data: result.rows, // Return the data
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching data:", error);

    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch data" }),
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
