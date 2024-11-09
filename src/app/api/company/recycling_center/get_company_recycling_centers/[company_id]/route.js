import { pool } from "../../../../../../database/database"; 

export async function GET(req, { params }) {
  let companyId = parseInt(params.company_id);
  let all_centers;

  console.log("company id: " , companyId);
  
  try {
    all_centers = await pool.query(
      'SELECT * from recycling_center where company_id = $1',
      [companyId]
    );

    if (all_centers.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          data: [],
          message: 'No recycling center found for the company.',
        }),
        {
          status: 200,
        }
      );
    }

    console.log(all_centers.rows); // Log all the fetched areas

    return new Response(
      JSON.stringify({
        success: true,
        data: all_centers.rows,
        message: 'All recycling centers fetched successfully!',
      }),
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error fetch recycling centers: ", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch recycling centers.',
        error: error.message,
      }),
      {
        status: 500, // Internal Server Error
      }
    );
  }
}
