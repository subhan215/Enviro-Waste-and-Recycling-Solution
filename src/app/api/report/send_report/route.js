import { NextResponse } from "next/server";
import { pool } from "../../../../database/database";
import * as geminiAi from "@/utils/geminiAi";

export async function POST(req){
    let {user_id, company_id, description} = await req.json();
    user_id = parseInt(user_id);    
    company_id = parseInt(company_id);

    const sentiment = await geminiAi.sentiment_analysis(description);


    // console.log(`In send report\n User ID: ${user_id} , Company ID : ${company_id} , Description: ${description} Sentiment: ${sentiment} SentimentToincheck : ${typeof(parseInt(sentiment))} `);
    
    const inserting_to_reports = await pool.query(`insert into reports (user_id, company_id, description, sentiment_rating) values ($1,$2, $3, $4) returning *` , [user_id, company_id , description, parseInt(sentiment) ])

    console.log("Inserting Rep : ", inserting_to_reports);

    return NextResponse.json({"message" : "Inserted to reports" , data : inserting_to_reports.rows[0], success: true});




}