import { NextResponse } from "next/server";
import {pool} from "../../../../../database/database"

export async function GET(req, {params}){
    let {user_id}  = params;
    user_id = parseInt(user_id);


    const user_report_q = await pool.query(`select * from reports where user_id = $1` , [user_id]);
    
    console.log("Report q len : ",user_report_q.rows.length);


    if(user_report_q.rows.length != 0)
    return NextResponse.json({"message" : "User report feteched" , data : user_report_q.rows[0] , success : true})
    else
    return NextResponse.json({"message" : "User doesnt have any reports!" , success : true})



}