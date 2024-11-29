import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
  const client = await pool.connect(); // Get a client for transaction management

  try {
    // Begin transaction
    await client.query("BEGIN");

    // Parse the incoming JSON request body
    const { user_id, account_type, account_details, conversion_amount, wallet_Bank_name } = await req.json();

    // Validation: Check if all required fields are provided
    if (!user_id || !account_type || !account_details || !conversion_amount || !wallet_Bank_name) {
      // Rollback transaction in case of validation failure
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields. Please provide user_id, account_type, account_details, and conversion_amount.",
        },
        { status: 400 }
      );
    }

    // Define the conversion rate and calculate the equivalent PKR
    const conversionRate = 0.5;
    const equivalentPKR = conversion_amount * conversionRate;

    // Insert the conversion request into the database
    const result = await client.query(
      `INSERT INTO RewardConversions (user_id, account_type, account_details, conversion_amount, equivalent_pkr, wallet_Bank_name) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, account_type, account_details, conversion_amount, equivalentPKR, wallet_Bank_name]
    );

    // Commit the transaction if the insertion is successful
    await client.query("COMMIT");

    // Return a success response
    return NextResponse.json(
      {
        success: true,
        message: "Conversion request created successfully!",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    // Rollback transaction in case of an error
    await client.query("ROLLBACK");
    console.error("Error creating reward conversion:", error);

    // Return an error response
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
