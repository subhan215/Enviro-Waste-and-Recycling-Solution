import { NextResponse } from "next/server";
import { pool } from "../../../../database/database";

export async function POST(req){
    const {company_id} = await req.json();

    const del_company = await pool.query(`delete from company where user_id = $1` , [company_id])

    return NextResponse.json({"message" : "Company Deleted Succesfully" , success: true})


}