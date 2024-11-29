import { NextResponse } from "next/server";
import { pool } from "@/database/database";

export async function GET(req, { params }) {
    const client = await pool.connect(); // Get a client for transaction management

    try {
        const company_id = params.company_id;

        if (!company_id) {
            return NextResponse.json({ message: 'company_id is required' }, { status: 400 });
        }

        // Begin a transaction to ensure atomicity
        await client.query("BEGIN");

        const query = `
            WITH ranked_requests AS (
                SELECT 
                    rf.request_id,
                    rf.weight,
                    rf.date,
                    rf.time,
                    rf.latitude,
                    rf.longitude,
                    rf.offered_price,
                    rc.latitude AS rc_latitude,
                    rc.longitude AS rc_longitude,
                    SQRT(POWER(rc.latitude - rf.latitude, 2) + POWER(rc.longitude - rf.longitude, 2)) AS distance,
                    ROW_NUMBER() OVER (PARTITION BY rf.request_id ORDER BY SQRT(POWER(rc.latitude - rf.latitude, 2) + POWER(rc.longitude - rf.longitude, 2))) AS rank
                FROM 
                    request_for_waste rf
                JOIN 
                    recycling_center rc ON rc.company_id = $1
            )
            SELECT 
                request_id,
                weight,
                date,
                time,
                latitude,
                longitude,
                offered_price,
                distance
            FROM 
                ranked_requests
            WHERE 
                rank = 1
            ORDER BY 
                distance ASC;
        `;

        const result = await client.query(query, [company_id]);

        // Map the result to include the distance
        const responseData = result.rows.map(row => ({
            request_id: row.request_id, 
            weight: row.weight,
            date: row.date,
            time: row.time,
            latitude: row.latitude,
            longitude: row.longitude,
            offered_price: row.offered_price,
            distance: row.distance, // Send the calculated distance to the frontend
        }));

        // Commit the transaction
        await client.query("COMMIT");

        return NextResponse.json({ requests: responseData }, { status: 200 });
    } catch (error) {
        // Rollback in case of an error
        await client.query("ROLLBACK");
        console.error('Error fetching sorted requests:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
