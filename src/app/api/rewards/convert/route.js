import { pool } from "../../../../database/database";

export async function POST(req) {
  try {
    // Parse the incoming JSON request body
    const { user_id, account_type, account_details, conversion_amount , wallet_Bank_name } = await req.json();

    // Validation: Check if all required fields are provided
    if (!user_id || !account_type || !account_details || !conversion_amount || !wallet_Bank_name) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required fields. Please provide user_id, account_type, account_details, and conversion_amount.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Define the conversion rate and calculate the equivalent PKR
    const conversionRate = 0.5;
    const equivalentPKR = conversion_amount * conversionRate;

    // Insert the conversion request into the database
    const result = await pool.query(
      `INSERT INTO RewardConversions (user_id, account_type, account_details, conversion_amount, equivalent_pkr , wallet_Bank_name) 
       VALUES ($1, $2, $3, $4, $5 , $6) RETURNING *`,
      [user_id, account_type, account_details, conversion_amount, equivalentPKR , wallet_Bank_name]
    );

    // Return a success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Conversion request created successfully!",
        data: result.rows[0],
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating reward conversion:", error);

    // Return an error response
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
