import bcrypt from "bcrypt";
import { pool } from "../../../../database/database";
import { validateEmail } from "../../../../validations/validateEmail";
import { validatePassword } from "../../../../validations/validatePassword";
import { NextResponse } from 'next/server';

const saltRounds = 10;

export async function POST(req) {
  const client = await pool.connect(); // Get a client for transaction management

  try {
    console.log("Signup request received");

    // Get the request body
    const { email, password, confirmPassword, name, gender, age, mobile, area_id } = await req.json();

    // Trim input fields
    const trimmedData = {
      name: name?.trim(),
      email: email?.trim(),
      password: password?.trim(),
      confirmPassword: confirmPassword?.trim(),
      gender,
      age,
      mobile,
      area_id: parseInt(area_id),
    };

    // Validate input fields
    if (!trimmedData.name || !trimmedData.email || !trimmedData.password || !trimmedData.confirmPassword || !trimmedData.gender || !trimmedData.age || !trimmedData.mobile || !trimmedData.area_id) {
      return new NextResponse(JSON.stringify({ success: false, message: "All fields are required." }), { status: 400 });
    }

    if (!validateEmail(trimmedData.email)) {
      return new NextResponse(JSON.stringify({ success: false, message: "Invalid email format." }), { status: 400 });
    }

    if (!validatePassword(trimmedData.password)) {
      return new NextResponse(JSON.stringify({ success: false, message: "Password must have at least 8 and a maximum of 20 characters, including numeric and special characters." }), { status: 400 });
    }

    // Start the transaction
    await client.query("BEGIN");

    // Check if user already exists
    const userExist = await client.query('SELECT * FROM "User" WHERE email_id = $1 LIMIT 1', [trimmedData.email]);

    if (userExist.rows.length > 0) {
      await client.query("ROLLBACK"); // Rollback if the user already exists
      return new NextResponse(JSON.stringify({ success: false, message: "Email already exists!" }), { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(trimmedData.password, saltRounds);

    // Insert new user into the database
    const result = await client.query(
      'INSERT INTO "User" (name, email_id, password, gender, age, mobile, area_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id, name, email_id, gender, age, mobile, area_id',
      [trimmedData.name, trimmedData.email, hashedPassword, trimmedData.gender, trimmedData.age, trimmedData.mobile, trimmedData.area_id]
    );

    const user = result.rows[0];

    // Commit the transaction
    await client.query("COMMIT");

    return new NextResponse(JSON.stringify({ success: true, userData: user, message: "Account registered successfully." }), { status: 200 });

  } catch (error) {
    // Rollback transaction if an error occurs
    await client.query("ROLLBACK");
    console.error("Error during signup:", error);
    return new NextResponse(JSON.stringify({ success: false, message: "Internal server error." }), { status: 500 });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}
