import { pool } from "../../../../../database/database";

export async function GET(req, { params }) {
    console.log("route hit!", params.id);
    let all_areas;
    
    try {
        const companyId = parseInt(params.id); // Convert params.id to an integer
        all_areas = await pool.query(
            'SELECT area.area_id , area.name FROM area LEFT JOIN trucks ON area.area_id = trucks.area_id WHERE area.company_id = $1::integer and truckid is null',
            [params.id] // Pass the companyId as an integer
        );

        console.log(all_areas);
    } catch (error) {
        console.log("Err:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Error fetching areas',
            }),
            {
                status: 500
            }
        );
    }

    return new Response(
        JSON.stringify({
            success: true,
            data: all_areas.rows,
            message: 'All non-assigned truck areas fetched!',
        }),
        {
            status: 200
        }
    );
}
