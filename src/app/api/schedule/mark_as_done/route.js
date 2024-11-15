import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function  POST(req) {
    const {schedule_id , weights } = await req.json();
    console.log("Schdule id : " , schedule_id);
    console.log("Weight : ", weights);
    let rewards = 0;
    for (let i = 0; i < weights.length; i++) {
        rewards += weights[i].rate_per_kg * weights[i].weight;
      }

       console.log("Total rewareds : " , rewards);

    //   all_areas = await pool.query(
    //     `SELECT area_id, name 
    //      FROM area 
    //      WHERE area_id NOT IN (
    //          SELECT area_id 
    //          FROM recycling_center 
    //          WHERE company_id = $1
    //      )`, 
    //     [company_id] // Pass company_id as a parameter
    // );

    // console.log(all_areas.rows); // Log all areas fetched
      const current_schdule = await pool.query(`SELECT user_id from schedule where schedule_id = $1`,[schedule_id])
      console.log("CSUO : ", current_schdule.rows[0].user_id);
      const current_schdule_user_id = current_schdule.rows[0].user_id;

      //inserting rewards
      const insert_rewards = await pool.query(`update "User" set rewards = rewards + $1 where user_id = $2` , [rewards , current_schdule_user_id]);

      console.log("Insert : " , insert_rewards);

      //Delete the schedule
      const del_sch = await pool.query('delete from schedule where schedule_id = $1' , [schedule_id]);

      





    return NextResponse.json({"message" : "try" , success : true});
}