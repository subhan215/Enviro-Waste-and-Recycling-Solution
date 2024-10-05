import { pool } from "../../../../database/database";
import bcrypt from "bcrypt";
import { validateEmail } from "../../../../validations/validateEmail";
import { validatePassword } from "../../../../validations/validatePassword";

const saltRounds = 10;

export async function POST(req) {
  console.log("Signup request received");

  // Get the request body
  const { email, password, confirmPassword, name, services, phone } = await req.json();

  // Trim input fields
  const trimmedData = {
    name: name?.trim(),
    email_id: email?.trim(),
    password: password?.trim(),
    confirmPassword: confirmPassword?.trim(),
    phone: phone?.trim(),
    services,  // Assuming services is already trimmed or validated elsewhere
  };

  // Validate input fields
  if (!trimmedData.name || !trimmedData.email_id || !trimmedData.password || !trimmedData.confirmPassword || !trimmedData.phone || !trimmedData.services) {
    return new Response(JSON.stringify({ success: false, message: "All fields are required." }), { status: 400 });
  }

  if (!validateEmail(trimmedData.email_id)) {
    return new Response(JSON.stringify({ success: false, message: "Invalid email format." }), { status: 400 });
  }

  if (!validatePassword(trimmedData.password)) {
    return new Response(JSON.stringify({ success: false, message: "Password must have at least 8 and a maximum of 20 characters, including numeric and special characters." }), { status: 400 });
  }

  try {
    // Check if the user already exists
    console.log("db q1");
    const companyExist = await pool.query('SELECT * FROM Company WHERE email_id = $1 LIMIT 1', [trimmedData.email_id]);
    console.log("db q2");

    if (companyExist.rows.length > 0) {
      return new Response(JSON.stringify({ success: false, message: "Email already exists!" }), { status: 400 });
    }

    // Hash the password and then store the user
    const hashedPassword = await bcrypt.hash(trimmedData.password, saltRounds);

    const result = await pool.query(
      'INSERT INTO Company (name, email_id, password, phone, services) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email_id, phone, services',
      [trimmedData.name, trimmedData.email_id, hashedPassword, trimmedData.phone, trimmedData.services]
    );

    const user = result.rows[0];

    return new Response(JSON.stringify({ success: true, userData: user, message: "Account registered successfully." }), { status: 200 });

  } catch (error) {
    console.error("Error during signup:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal server error." }), { status: 500 });
  }
}
