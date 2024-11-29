import { pool } from "../../../../database/database";
import bcrypt from "bcrypt";
import { validateEmail } from "../../../../validations/validateEmail";
import { validatePassword } from "../../../../validations/validatePassword";
import { NextResponse } from "next/server";

const saltRounds = 10;

export async function POST(req) {
  console.log("Signup request received");

  // Get the request body
  const { email, password, confirmPassword, name, services, phone, agreementChecked } = await req.json();

  // Trim input fields
  const trimmedData = {
    name: name?.trim(),
    email_id: email?.trim(),
    password: password?.trim(),
    confirmPassword: confirmPassword?.trim(),
    phone: phone?.trim(),
    services, // Assuming services is already trimmed or validated elsewhere
    agreementChecked,
  };

  // Validate input fields
  if (
    !trimmedData.name ||
    !trimmedData.email_id ||
    !trimmedData.password ||
    !trimmedData.confirmPassword ||
    !trimmedData.phone ||
    !trimmedData.services ||
    trimmedData.agreementChecked === undefined
  ) {
    return NextResponse.json(
      { success: false, message: "All fields are required." },
      { status: 400 }
    );
  }

  if (!validateEmail(trimmedData.email_id)) {
    return NextResponse.json(
      { success: false, message: "Invalid email format." },
      { status: 400 }
    );
  }

  if (!validatePassword(trimmedData.password)) {
    return NextResponse.json(
      {
        success: false,
        message: "Password must have at least 8 and a maximum of 20 characters, including numeric and special characters.",
      },
      { status: 400 }
    );
  }

  if (!trimmedData.agreementChecked) {
    return NextResponse.json(
      { success: false, message: "You must agree to the terms and conditions to register." },
      { status: 400 }
    );
  }

  // Create a client for transaction handling
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');

    // Check if the user already exists
    const companyExist = await client.query(
      "SELECT * FROM Company WHERE email_id = $1 LIMIT 1",
      [trimmedData.email_id]
    );

    if (companyExist.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email already exists!" },
        { status: 400 }
      );
    }

    // Hash the password and then store the company
    const hashedPassword = await bcrypt.hash(trimmedData.password, saltRounds);

    // Insert into Company table
    const result = await client.query(
      "INSERT INTO Company (name, email_id, password, phone) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email_id, phone",
      [trimmedData.name, trimmedData.email_id, hashedPassword, trimmedData.phone]
    );

    const user = result.rows[0];

    // Insert into Company_Services table
    const serviceInsertQueries = trimmedData.services.map((service) => {
      return client.query(
        "INSERT INTO Company_Services (company_id, service) VALUES ($1, $2)",
        [user.user_id, service]
      );
    });

    // Wait for all service inserts to complete
    await Promise.all(serviceInsertQueries);

    // Insert agreement record
    const agreementText = `This agreement confirms that the company '${user.name}' agrees to the terms and conditions.`;
    const agreementStatus = "Accepted";

    await client.query(
      "INSERT INTO Agreement (status, text, company_id, created_at) VALUES ($1, $2, $3, NOW())",
      [agreementStatus, agreementText, user.user_id]
    );

    // Commit the transaction after all operations
    await client.query('COMMIT');

    // Success response
    return NextResponse.json(
      {
        success: true,
        userData: user,
        message: "Account registered successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    // Rollback transaction if any error occurs
    await client.query('ROLLBACK');
    console.error("Error during signup:", error);

    // Error response
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
