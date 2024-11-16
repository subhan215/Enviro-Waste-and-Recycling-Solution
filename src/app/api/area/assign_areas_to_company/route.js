import { pool } from "../../../../database/database";

export async function POST(req) {
    const {selectedAreas , company_id} = await req.json();
    console.log("se : ",selectedAreas);

    const assigning = await pool.query('update area set company_id = $1 where area_id = any($2)' , [company_id,selectedAreas])

    // return res.status(200).json({
    //     success : true,
    //     data : selected_areas,
    //     message: 'selected areas assigned!'
    //  })


 return new Response(
    JSON.stringify({
        success : true,
        data : selectedAreas,
        message: 'Areas assinged to company!',
    }),
    {
        status : 200
    }
 )

}