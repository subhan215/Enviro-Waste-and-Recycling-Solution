import { pool } from "../../../../../database/database";

export async function POST(req, { params }) {
    console.log("route hit!", params.id);
    const {truck_data} = await req.json();  
    console.log(truck_data) ; 
    let truck = null ; 
    try {
        const companyId = parseInt(params.id); // Convert params.id to an integer
         truck = await pool.query(
            'SELECT * FROM trucks where licenseplate = $1',
            [truck_data.licensePlate] // Pass the companyId as an integer
        );
        if(truck.rows[0]) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Truck with the given license plate already exists!',
                }),
                {
                    status: 500
                }
            );
        }
        const result = await pool.query(
            'INSERT INTO trucks (companyid, licenseplate, capacity, area_id) VALUES ($1, $2, $3, $4) RETURNING truckid, companyid, licenseplate, capacity, area_id',
            [companyId , truck_data.licensePlate , parseFloat(truck_data.capacity) ,parseInt(truck_data.area_id )]
          );
        if(result.rows[0]) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Truck entity created and assigned to area!',
                }),
                {
                    status: 200
                }
            );
        }  
        else {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Error assigning truck to area!',
                }),
                {
                    status: 500
                }
            );
        } 
    } catch (error) {
        console.log("Err:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Error assigning truck to area!',
            }),
            {
                status: 500
            }
        );
    }

    
}
