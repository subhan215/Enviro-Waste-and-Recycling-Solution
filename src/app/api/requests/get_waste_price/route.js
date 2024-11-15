import { pool } from "../../../../database/database";
import { NextResponse } from "next/server"



export async function GET (req) {

    try {
        const requestQuery = `
            SELECT name , rate_per_kg
            FROM recycling_categories
        `;
        const { rows } = await pool.query(requestQuery);


        return NextResponse.json({"message" : "Waste prices feteched!" , data : rows , success : true})
        



        
    } catch (error) {
        console.log("Error in getting waste prices! error: ",error );
        return NextResponse.json({"message" : "Error in getting waste prices" , success : false});
    }


}