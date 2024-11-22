import { NextResponse } from "next/server";
import { pool } from "../../../../database/database";


export async function POST(req){
    let {rating , schedule_id} = await req.json();

    rating = parseFloat(rating);

    const get_company_id = await pool.query(`select company_id from schedule where schedule_id = $1` , [schedule_id]);
    console.log("Comapny id by scheduek : " , get_company_id.rows[0].company_id);
    
    //calculating avg rating of company
    let company_id =  get_company_id.rows[0].company_id;
    const get_comp_rat = await pool.query(`select avg_rating from company where user_id = $1` , [company_id]);
    let avg_rating = get_comp_rat.rows[0].avg_rating
    if(avg_rating == 0){
        avg_rating = rating;
    }
    else{
        console.log("Curr Avg rating : " , avg_rating);
        console.log("New rating : ", rating);
        avg_rating += rating;
        console.log("SUm : " , avg_rating);
        avg_rating /= 2;
        console.log("New Avg rating : " , avg_rating);
    }
    const update_avg_rating = await pool.query(`update company set avg_rating = $1 where user_id = $2` , [avg_rating, company_id])

    //deleting schedule
    const del_sch = await pool.query('delete from schedule where schedule_id = $1' , [schedule_id]);

    return NextResponse.json({"message" : "Schedule del + rating given", success : true});
    


} 