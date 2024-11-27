 import { pool } from "@/database/database"; 
export async function GET(req, { params }) {
  let companyId = parseInt(params.company_id);
  let all_trucks;

  console.log(companyId);
  
  try {
    all_trucks = await pool.query(
      'SELECT trucks.truckid, trucks.licenseplate , trucks.capacity FROM trucks WHERE trucks.companyid = $1',
      [companyId]
    );

    if (all_trucks.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          data: [],
          message: 'No trucks found for this company.',
        }),
        {
          status: 200,
        }
      );
    }

    console.log(all_trucks.rows); // Log all the fetched areas

    return new Response(
      JSON.stringify({
        success: true,
        data: all_trucks.rows,
        message: 'All trucks fetched successfully!',
      }),
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error fetching assigned areas: ", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch trucks.',
        error: error.message,
      }),
      {
        status: 500, // Internal Server Error
      }
    );
  }
}
