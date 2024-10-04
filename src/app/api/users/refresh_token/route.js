import { pool } from "../../../../database/database";
import { generate_access_token } from "../../../../utils/user.utils";
import { NextResponse } from 'next/server';
import jwt from "jsonwebtoken" ; 
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
    const decoded_token = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    console.log("refresh token decoded: " , decoded_token)
    // Query to find the user by refresh token
    let users = await pool.query(
      'SELECT user_id, email_id, name FROM "User" WHERE user_id = $1 AND email_id = $2', 
      [decoded_token.user_id , decoded_token.email_id]
    );
    
    if (users.rows.length === 0) {
      users = await pool.query(
        'SELECT user_id, email_id, name FROM company WHERE user_id = $1 AND email_id = $2 ', 
        [decoded_token.user_id , decoded_token.email_id]
      );
      if(users.rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: "Refresh token doesn't exist or has expired!"
        }, { status: 404 });
      }
      
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
