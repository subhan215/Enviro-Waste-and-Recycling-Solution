import { pool } from "../../../../database/database";

export async function POST(req) {
    const company_id = 2; //for testing
    const {selected_areas} = await req.json();
    console.log("se : ",selected_areas);

    const assigning = await pool.query('update area set company_id = $1 where area_id = any($2)' , [company_id,selected_areas])

    // return res.status(200).json({
    //     success : true,
    //     data : selected_areas,
    //     message: 'selected areas assigned!'
    //  })


 return new Response(
    JSON.stringify({
        success : true,
        data : selected_areas,
        message: 'Areas assinged to company!',
    }),
    {
        status : 200
    }
 )

}