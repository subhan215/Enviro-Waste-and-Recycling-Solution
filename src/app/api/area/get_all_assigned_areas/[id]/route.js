import { pool } from "../../../../../database/database";

export async function GET(req, { params }) {
  let companyId = parseInt(params.id);
  let all_areas;

  console.log(companyId);
  
  try {
    all_areas = await pool.query(
      'SELECT DISTINCT area.name, area.area_id, trucks.truckid, trucks.licenseplate FROM area JOIN trucks ON area.area_id = trucks.area_id WHERE area.company_id = $1',
      [companyId]
    );

    if (all_areas.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          data: [],
          message: 'No assigned areas found for this company.',
        }),
        {
          status: 200,
        }
      );
    }

    console.log(all_areas.rows); // Log all the fetched areas

    return new Response(
      JSON.stringify({
        success: true,
        data: all_areas.rows,
        message: 'All assigned areas fetched successfully!',
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
        message: 'Failed to fetch assigned areas.',
        error: error.message,
      }),
      {
        status: 500, // Internal Server Error
      }
    );
  }
}
