import {pool} from "../../../../database/database"

export async function POST(req) {
  try {
    const { company_id } = await req.json();

    // Query to check if the agreement exists
    const agreementQuery = await pool.query(
      `SELECT * FROM Agreement WHERE company_id = $1`,
      [company_id]
    );
    console.log(agreementQuery)
    if (agreementQuery.rows.length > 0) {
      return new Response(
        JSON.stringify({ success: true, agreementExists: true }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ success: true, agreementExists: false }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error checking agreement:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error checking agreement." }),
      { status: 500 }
    );
  }
}
