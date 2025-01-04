import { pool } from "../../../../database/database";
import { NextResponse } from 'next/server';  // Import NextResponse

export async function POST(req) {
    const { schedule_id, truck_id } = await req.json();

    if (!schedule_id || !truck_id) {
        return new NextResponse(
            JSON.stringify({ error: 'Schedule ID and Truck ID are required' }),
            { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }

    const client = await pool.connect();

    try {
        // Start the transaction
        await client.query('BEGIN');

        // Update the schedule to assign a truck
        const updateQuery = `
            UPDATE schedule
            SET truck_id = $1
            WHERE schedule_id = $2
            RETURNING *;
        `;
        const { rows } = await client.query(updateQuery, [truck_id, schedule_id]);

        if (rows.length === 0) {
            // If no schedule is found or truck is not assigned, roll back and return error
            await client.query('ROLLBACK');
            return new NextResponse(
                JSON.stringify({ message: 'Schedule not found or truck not assigned' }),
                { 
                    status: 404, 
                    headers: { 'Content-Type': 'application/json' } 
                }
            );
        }

        // Retrieve distinct schedule and truck details
        const joinQuery = `
            SELECT DISTINCT 
                s.schedule_id,
                s.date,
                s.time,
                s.status,
                t.truckid,
                t.licenseplate,
                t.capacity
            FROM schedule s
            LEFT JOIN trucks t ON s.truck_id = t.truckid
            WHERE s.schedule_id = $1;
        `;
        const { rows: joinedRows } = await client.query(joinQuery, [schedule_id]);

        // Commit the transaction
        await client.query('COMMIT');

        return new NextResponse(
            JSON.stringify({ 
                message: 'Truck assigned successfully', 
                schedule: joinedRows[0] 
            }),
            { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    } catch (error) {
        // If an error occurs, roll back the transaction and log the error
        await client.query('ROLLBACK');
        console.error('Error assigning truck to schedule:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal server error' }),
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    } finally {
        // Release the client to the pool
        client.release();
    }
}
