import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { pool } from "../../../database/database";

export async function POST(req) {
  const client = await pool.connect(); // Start a new client connection for transaction handling
  try {
    const { accessToken } = await req.json();
    const decoded_token = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log(accessToken)
    let role = "user";
    let user = null;

    // Begin the transaction
    await client.query('BEGIN');

    // Query to fetch user data based on user_id and email_id
    let result = await client.query(
      'SELECT * FROM "User" WHERE user_id = $1 AND email_id = $2',
      [decoded_token.user_id, decoded_token.email_id]
    );

    if (result.rows.length > 0) {
      user = result.rows[0]; // Assign user if found
    } else {
      // If not found in "User", check in the "company" table
      result = await client.query(
        'SELECT * FROM company WHERE user_id = $1 AND email_id = $2',
        [decoded_token.user_id, decoded_token.email_id]
      );
      role = "company";
      if (result.rows.length > 0) {
        user = result.rows[0];
      } else {
        console.log("Cannot find user based on the id in the token.");
      }
    }

    // Commit the transaction
    await client.query('COMMIT');

    // If the user is found, return the user data and role
    if (user) {
      return NextResponse.json({
        success: true,
        user,
        role,
      });
    }

    // If no user found, return failure response
    return NextResponse.json({
      success: false,
      message: 'User not found',
    });

  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');
    console.error("Error fetching user: ", error);

    return NextResponse.json({
      success: false,
      message: 'Failed to verify user.',
      error: error.message,
    }, {
      status: 500, // Internal Server Error
    });

  } finally {
    client.release(); // Release the client back to the pool
  }
}
