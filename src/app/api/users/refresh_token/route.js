import { pool } from "../../../../database/database";
import { generate_access_token } from "../../../../utils/user.utils";
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.get("authorization")?.replace("Bearer ", "")?.replace(/^["']|["']$/g, '');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Refresh Token is necessary!"
      }, { status: 404 });
    }
    console.log(token) ; 
    // Query to find the user by refresh token
    const users = await pool.query(
      'SELECT user_id, email_id, name FROM "User" WHERE refresh_token = $1', 
      [token]
    );
    
    if (users.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Refresh token doesn't exist or has expired!"
      }, { status: 404 });
    }

    // Generate a new access token
    const access_token = generate_access_token(
      users.rows[0].user_id, 
      users.rows[0].email_id, 
      users.rows[0].name
    );

    return NextResponse.json({
      success: true,
      data: { access_token },
      message: "Access Token successfully generated!"
    }, { status: 200 });

  } catch (error) {
    console.error("Error during token refresh:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error."
    }, { status: 500 });
  }
}
