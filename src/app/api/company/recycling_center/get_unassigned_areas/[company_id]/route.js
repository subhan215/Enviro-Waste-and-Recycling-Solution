import { pool } from "../../../../../../database/database";

export async function GET(req, { params }) {
    // Extract the company_id from the request parameters
    const { company_id } = params;
    console.log("company_id " , company_id) ; 
    let all_areas;
    try {
        // Fetch areas that are not served by the specified company
        all_areas = await pool.query(
            `SELECT area_id, name 
             FROM area 
             WHERE area_id NOT IN (
                 SELECT area_id 
                 FROM recycling_center 
                 WHERE company_id = $1
             )`, 
            [company_id] // Pass company_id as a parameter
        );

        console.log(all_areas.rows); // Log all areas fetched
    } catch (error) {
        console.log("Err: ", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Error fetching areas.',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    return new Response(
        JSON.stringify({
            success: true,
            data: all_areas.rows,
            message: 'All non-served areas fetched!',
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' } // Ensure response is in JSON format
        }
    );
}
