import { pool } from "../../../../database/database";
import { check_password, generate_access_and_refresh_tokens } from "../../../../utils/user.utils";
import jwt from "jsonwebtoken";
import { NextResponse } from 'next/server';

export async function POST(req) {
  const client = await pool.connect(); // Get a client for transaction management
  
  try {
    // Begin the transaction
    await client.query("BEGIN");

    // Extract token from cookies or Authorization header
    const token = (req.cookies?.get('access_token')?.value || req.headers.get('Authorization')?.replace('Bearer ', ''))?.replace(/^["']|["']$/g, '');
    console.log('token:', token);

    let role = "user"; 

    let user = null;

    if (token) {
      // Verify and decode the token
      const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log('Decoded Token:', decoded_token);

      // Find the user by the decoded user_id from the token
      let result = await client.query('SELECT * FROM "User" WHERE user_id = $1 AND email_id = $2', [decoded_token.user_id , decoded_token.email_id]);

      if (result.rows.length > 0) {
        user = result.rows[0]; // Assign user if found
      } else {
        role = "company"; 
        result = await client.query('SELECT * FROM company WHERE user_id = $1 AND email_id = $2', [decoded_token.user_id , decoded_token.email_id]);
        if (result.rows.length > 0) {
          user = result.rows[0];
        } else {
          console.log("Cannot find user based on the id in the token.");
        }
      }
    }

    // If the user is logged in, return a message
    if (user) {
      // Rollback transaction if user is found
      await client.query("ROLLBACK");
      return NextResponse.json({
        success: true,
        message: "User/Company is already logged in.",
        role
      }, { status: 403 }); // Forbidden status
    }

    const { email, password } = await req.json();

    if (!email || email.trim() === "" || !password || password.trim() === "") {
      // Rollback transaction if input validation fails
      await client.query("ROLLBACK");
      return NextResponse.json({
        success: false,
        message: "All fields are required."
      }, { status: 400 });
    }

    // Check if user exists
    let does_user_email_exist = await client.query(
      'SELECT * FROM "User" WHERE email_id = $1',
      [email]
    );

    if (does_user_email_exist.rows.length === 0) {
      does_user_email_exist = await client.query(
        'SELECT * FROM company WHERE email_id = $1',
        [email]
      );
      role = "company"; 
      if (does_user_email_exist.rows.length === 0) {
        // Rollback transaction if no user/company is found
        await client.query("ROLLBACK");
        return NextResponse.json({
          success: false,
          message: "No user/company exists with the given email"
        }, { status: 400 });
      }
    }

    // Check password
    if (!check_password(does_user_email_exist.rows[0].password, password)) {
      // Rollback transaction if password is invalid
      await client.query("ROLLBACK");
      return NextResponse.json({
        success: false,
        message: "Invalid password"
      }, { status: 400 });
    }

    // Generate access and refresh tokens
    const { access_token, refresh_token } = await generate_access_and_refresh_tokens(
      does_user_email_exist.rows[0].user_id,
      does_user_email_exist.rows[0].email_id,
      does_user_email_exist.rows[0].name
    );

    //const options = {
     // httpOnly: true,
      //secure: process.env.NODE_ENV === "production", // Only set secure in production
      //maxAge: 3600, // Cookie will expire in 1 hour (3600 seconds)
    //};

    // Commit the transaction
    await client.query("COMMIT");

    // Return success response with tokens
    const res = new NextResponse(
      JSON.stringify({
        success: true,
        data: { access_token, refresh_token, role  , ...does_user_email_exist.rows[0]},
        message: "User logged in successfully!",
      }),
      { status: 200 }
    );

    // Set cookies for access and refresh tokens
    //res.cookies.set('access_token', access_token, options);
    //res.cookies.set('refresh_token', refresh_token, options);

    return res;

  } catch (error) {
    // Rollback in case of any error
    await client.query("ROLLBACK");
    console.error("Error during sign-in:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error."
    }, { status: 500 });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}
