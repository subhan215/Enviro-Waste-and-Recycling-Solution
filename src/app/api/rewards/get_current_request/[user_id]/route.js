import {pool} from "../../../../../database/database"
export async function GET(req , {params}) {
  try {
    const {user_id} = params ; 
    let userId = user_id
    console.log(userId)
    // Validation: Ensure user_id is provided
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing user_id parameter." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Query the database for current transaction requests
    const result = await pool.query(
      `SELECT * FROM RewardConversions WHERE user_id = $1 and (isseen = false or isseen is null)`,
      [userId]
    );

    // Return the transaction requests
    return new Response(
      JSON.stringify({ success: true, data: result.rows[0] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching current transaction requests:", error);

    return new Response(
      JSON.stringify({ success: false, message: "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
