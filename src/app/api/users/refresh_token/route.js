import { pool } from "../../../../database/database";
import { generate_access_token } from "../../../../utils/user.utils";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Explicitly mark the route as dynamic
export const dynamic = "force-dynamic";

export async function GET(req) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Extract the token from the Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          success: false,
          message: "Refresh Token is necessary!",
        },
        { status: 400 }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Query to find the user by refresh token
    const queryUser = `
      SELECT user_id, email_id, name FROM "User" 
      WHERE user_id = $1 AND email_id = $2
    `;
    let result = await client.query(queryUser, [
      decodedToken.user_id,
      decodedToken.email_id,
    ]);

    // If not found in the "User" table, check the "company" table
    if (result.rows.length === 0) {
      const queryCompany = `
        SELECT user_id, email_id, name FROM company 
        WHERE user_id = $1 AND email_id = $2
      `;
      result = await client.query(queryCompany, [
        decodedToken.user_id,
        decodedToken.email_id,
      ]);

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            success: false,
            message: "Refresh token doesn't exist or has expired!",
          },
          { status: 404 }
        );
      }
    }

    // Generate a new access token
    const user = result.rows[0];
    const accessToken = generate_access_token(
      user.user_id,
      user.email_id,
      user.name
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        data: { access_token: accessToken },
        message: "Access Token successfully generated!",
      },
      { status: 200 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error during token refresh:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
