import { pool } from "../../../../../database/database";

export async function POST(req) {
    console.log("Create Recycling Center request received");

    try {
        const { company_id, area_id, latitude, longitude } = await req.json();
        
        // Convert input fields to the correct types
        const parsedData = {
            company_id: parseInt(company_id, 10),
            area_id: parseInt(area_id, 10),  // Convert area_id to integer
            latitude: parseFloat(latitude),    // Convert latitude to float
            longitude: parseFloat(longitude),  // Convert longitude to float
        };
        console.log(parsedData);

        // Validate input data
        if (
            isNaN(parsedData.company_id) ||
            isNaN(parsedData.area_id) ||
            isNaN(parsedData.latitude) ||
            isNaN(parsedData.longitude)
        ) {
            return new Response(
                JSON.stringify({ success: false, message: 'All fields are required and must be of correct type.' }), 
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Check if the recycling center already exists
        const existingCenterResult = await pool.query(
            `SELECT * FROM recycling_center WHERE company_id = $1 AND area_id = $2`,
            [parsedData.company_id, parsedData.area_id]
        );

        if (existingCenterResult.rows.length > 0) {
            return new Response(
                JSON.stringify({ success: false, message: 'Recycling center already exists!' }), 
                {
                    status: 409,
                    headers: { 'Content-Type': 'application/json' },
                } 
            );
        }

        // Insert the new recycling center into the database
        const insertResult = await pool.query(
            `INSERT INTO recycling_center (company_id, area_id, latitude, longitude)
             VALUES ($1, $2, $3, $4) RETURNING recycling_center_id, company_id, area_id, latitude, longitude`,
            [parsedData.company_id, parsedData.area_id, parsedData.latitude, parsedData.longitude]
        );

        const newCenter = insertResult.rows[0];
        console.log(newCenter) ; 
        // Return the newly created recycling center
        return new Response(
            JSON.stringify({ success: true, data: newCenter, message: "Recycling center created successfully." }), 
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error creating recycling center:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Error creating recycling center.' }), 
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
