import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
    console.log("Create Recycling Center request received");

    const client = await pool.connect(); // Create a client for transaction handling

    try {
        const { company_id, latitude, longitude } = await req.json();
        
        // Convert input fields to the correct types
        const parsedData = {
            company_id: parseInt(company_id, 10),
            latitude: parseFloat(latitude),    // Convert latitude to float
            longitude: parseFloat(longitude),  // Convert longitude to float
        };
        console.log(parsedData);

        // Validate input data
        if (
            isNaN(parsedData.company_id) ||
            isNaN(parsedData.latitude) ||
            isNaN(parsedData.longitude)
        ) {
            return NextResponse.json(
                { success: false, message: 'All fields are required and must be of correct type.' }, 
                { status: 400 }
            );
        }

        // Begin transaction
        await client.query('BEGIN');

        // Check if the recycling center already exists
        const existingCenterResult = await client.query(
            `SELECT * FROM recycling_center WHERE company_id = $1 AND latitude = $2 AND longitude = $3`,
            [parsedData.company_id, parsedData.latitude , parsedData.longitude]
        );

        if (existingCenterResult.rows.length > 0) {
            // Rollback transaction if the center already exists
            await client.query('ROLLBACK');
            return NextResponse.json(
                { success: false, message: 'Recycling center already exists!' }, 
                { status: 409 }
            );
        }

        // Insert the new recycling center into the database
        const insertResult = await client.query(
            `INSERT INTO recycling_center (company_id , latitude, longitude)
             VALUES ($1, $2, $3) RETURNING recycling_center_id, company_id,latitude, longitude`,
            [parsedData.company_id,parsedData.latitude, parsedData.longitude]
        );

        const newCenter = insertResult.rows[0];
        console.log(newCenter); 

        // Commit the transaction after successfully creating the center
        await client.query('COMMIT');

        // Return the newly created recycling center
        return NextResponse.json(
            { success: true, data: newCenter, message: "Recycling center created successfully." }, 
            { status: 201 }
        );
    } catch (error) {
        // Rollback the transaction in case of any error
        await client.query('ROLLBACK');
        console.error('Error creating recycling center:', error);
        return NextResponse.json(
            { success: false, message: 'Error creating recycling center.' }, 
            { status: 500 }
        );
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
