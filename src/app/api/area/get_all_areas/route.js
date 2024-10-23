import { pool } from "../../../../database/database";

export async function GET(req) {
    let all_areas;
    try {
    all_areas = await pool.query('select * from area');
    console.log(all_areas.rows[0]);
    
 } catch (error) {
    console.log("Err:  ",error);
 }
 

 return new Response(
    JSON.stringify({
        success : true,
        data : all_areas.rows,
        message: 'all areas feteched!',
    }),
    {
        status : 200
    }
 )

}