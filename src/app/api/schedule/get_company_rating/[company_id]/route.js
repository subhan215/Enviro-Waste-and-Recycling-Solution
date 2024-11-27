import { NextResponse } from 'next/server';
import {pool} from '../../../../../database/database'

export async function GET(req,{params}){
    const {company_id} = params
    console.log("Company id got:  ", company_id );
    
    const get_rating = await pool.query(`select avg_rating from company where user_id = $1` , [company_id]);

    console.log("Rating goT : " , get_rating);
    

    return NextResponse.json({"message" : "Company rating fetched!",  data : get_rating.rows[0].avg_rating , success: true})


}