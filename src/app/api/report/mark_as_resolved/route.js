import { NextResponse } from "next/server";
import { pool } from "../../../../database/database";

export async function POST(req){
    const {report_id} = await req.json();

    console.log("Report id recived at bacekdn: " , report_id);
    

    const remove_report = await pool.query(`delete from reports where report_id = $1` , [report_id]);

    return NextResponse.json({"message" : "report resolved successfully" , success : true})


}