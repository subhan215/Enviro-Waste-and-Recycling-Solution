import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req){
    const all_reports = await pool.query(`select * from reports order by sentiment_rating desc`);

    console.log("All reps : ", all_reports);
    

    if(all_reports.rows.length != 0)
        return NextResponse.json({"message" : "All reports feteched" , data : all_reports.rows , success : true})
    else
        return NextResponse.json({"message" : "No reports yet" , success : true})

}