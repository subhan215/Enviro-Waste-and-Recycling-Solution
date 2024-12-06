import { pool } from "../../../../database/database";
import { NextResponse } from 'next/server';

export async function POST(req) {
  const client = await pool.connect(); // Get a client for transaction management

  try {
    // Begin the transaction
    await client.query("BEGIN");

    const { user_id } = await req.json();

    // Update the user's refresh_token to NULL
    const current_user = await client.query(
      'UPDATE "User" SET refresh_token = NULL WHERE user_id = $1 RETURNING user_id, name, email_id, gender, age, mobile, area_id',
      [user_id]
    );

    // Commit the transaction
    await client.query("COMMIT");

    // Return success response with the current user data
    return new NextResponse(
      JSON.stringify({
        success: true,
        data: current_user.rows[0],
        message: "User logged out!"
      }),
      { status: 200 }
    );

  } catch (error) {
    // Rollback transaction if error occurs
    await client.query("ROLLBACK");
    console.error("Error during sign out:", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Internal server error."
      }),
      { status: 500 }
    );
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}
