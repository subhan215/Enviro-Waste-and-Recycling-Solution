import { pool } from "../../../../database/database";
import { check_password, generate_access_and_refresh_tokens } from "../../../../utils/user.utils";
import jwt from "jsonwebtoken" ; 
export async function POST(req) {



  
  try {
    // Extract token from cookies or Authorization header
    const token = (req.cookies?.get('access_token')?.value || req.headers.get('Authorization')?.replace('Bearer ', ''))?.replace(/^["']|["']$/g, '');
console.log('token:', token);

    // Check if the user is already logged in
    let user = null;
    if (token) {
      // Verify and decode the token
      const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log('Decoded Token:', decoded_token);

      // Find the user by the decoded user_id from the token
      let result = await pool.query('SELECT * FROM "User" WHERE user_id = $1 AND email_id = $2', [decoded_token.user_id , decoded_token.email_id]);

      if (result.rows.length > 0) {
        user = result.rows[0]; // Assign user if found
      } else {
        result = await pool.query('SELECT * FROM company WHERE user_id = $1 AND email_id = $2', [decoded_token.user_id , decoded_token.email_id]);
        if(result.rows.length > 0) {
          user = result.rows[0] ; 
        }
        else {
          console.log("Cannot find user based on the id in the token.");
        }
       
      }
    }

    // If the user is logged in, return a message
    if (user) {
      return new Response(
        JSON.stringify({ success: true, message: "User/Company is already logged in." }),
        { status: 403 } // Forbidden status
      );
    }

    const { email, password } = await req.json();

    if (!email || email.trim() === "" || !password || password.trim() === "") {
      return new Response(
        JSON.stringify({ success: false, message: "All fields are required." }),
        { status: 400 }
      );
    }

    // Check if user exists
    let does_user_email_exist = await pool.query(
      'SELECT * FROM "User" WHERE email_id = $1',
      [email]
    );

    if (does_user_email_exist.rows.length === 0) {
      does_user_email_exist = await pool.query(
        'SELECT * FROM company WHERE email_id = $1',
        [email]
      );
      if(does_user_email_exist.rows.length === 0) {
        return new Response(
          JSON.stringify({ success: false, message: "No user/company exists with given email" }),
          { status: 400 }
        );
      }
      
    }

    // Check password
    if (!check_password(does_user_email_exist.rows[0].password, password)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid password" }),
        { status: 400 }
      );
    }

    // Generate access and refresh tokens
    const { access_token, refresh_token } = await generate_access_and_refresh_tokens(
      does_user_email_exist.rows[0].user_id ,
      does_user_email_exist.rows[0].email_id,
      does_user_email_exist.rows[0].name
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only set secure in production
      maxAge: 3600, // Cookie will expire in 1 hour (3600 seconds)
    };
    

    // Return success response with tokens
    const res = new Response(
      JSON.stringify({
        success: true,
        data: { access_token, refresh_token },
        message: "User logged in successfully!",
      }),
      { status: 200 }
    );

    //res.headers.append("Set-Cookie", `access_token=${access_token}; HttpOnly; Max-Age=${options.maxAge}; ${options.secure ? 'Secure' : ''}`);
//res.headers.append("Set-Cookie", `refresh_token=${refresh_token}; HttpOnly; Max-Age=${options.maxAge}; ${options.secure ? 'Secure' : ''}`);
    return res;

  } catch (error) {
    console.error("Error during sign-in:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error." }),
      { status: 500 }
    );
  }
}
