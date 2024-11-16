import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { pool } from "../../../database/database";


export async function POST(req) {
    const {accessToken} = await req.json() ; 
    const decoded_token = jwt.verify(accessToken , process.env.ACCESS_TOKEN_SECRET) ; 
    let role = "user" ; 
    let result = await pool.query('SELECT * FROM "User" WHERE user_id = $1 AND email_id = $2', [decoded_token.user_id , decoded_token.email_id]);
    let user= null;
    if (result.rows.length > 0) {
        user = result.rows[0]; // Assign user if found
      } else {
        result = await pool.query('SELECT * FROM company WHERE user_id = $1 AND email_id = $2', [decoded_token.user_id , decoded_token.email_id]);
        role = "company" ; 
        if(result.rows.length > 0) {
          user = result.rows[0] ; 
        }
        else {
          console.log("Cannot find user based on the id in the token.");
        }
       
      }
      // If the user is logged in, return a message
    if (user) {
        return NextResponse.json({ success: true, user , role });
      }
      return NextResponse.json({ success: false, message: 'User not found' });
    }

    
