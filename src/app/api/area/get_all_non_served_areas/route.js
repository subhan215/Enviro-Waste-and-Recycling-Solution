import { pool } from "../../../../database/database";

export async function GET(req) {
    let all_areas;
    try {
    all_areas = await pool.query('select * from area where company_id is null');
    console.log(all_areas.rows[0]);
    
 } catch (error) {
    console.log("Err:  ",error);
 }
 

 return new Response(
    JSON.stringify({
        success : true,
        data : all_areas.rows,
        message: 'all non served areas feteched!',
    }),
    {
        status : 200
    }
 )

}