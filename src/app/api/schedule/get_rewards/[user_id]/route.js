import { NextResponse } from "next/server";
import { pool } from "../../../../../database/database";


export async function GET(req,{params}) {
    const user_id = parseInt(params.user_id);
    console.log("USer ID : ",user_id)
    const user_reward_q = await pool.query(`select rewards from "User" where user_id = $1` , [user_id]);
    console.log("UREQ : ", user_reward_q );
    


    return NextResponse.json({"message" : "User rewards fetched!" , data : user_reward_q.rows[0].rewards , success : true});

}