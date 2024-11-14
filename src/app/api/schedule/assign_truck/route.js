import { pool } from "../../../../database/database";

export async function POST(req, { params }) {
    const { schedule_id, truck_id } = await req.json();

    if (!schedule_id || !truck_id) {
        return new Response(JSON.stringify({ error: 'Schedule ID and Truck ID are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    console.log(schedule_id , truck_id)
    try {
        // Query to assign a truck to a schedule
        const query = `
            UPDATE schedule
            SET truck_id = $1
            WHERE schedule_id = $2
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [truck_id, schedule_id]);

        if (rows.length === 0) {
            return new Response(JSON.stringify({ message: 'Schedule not found or truck not assigned' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ message: 'Truck assigned successfully', schedule: rows[0] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Error assigning truck to schedule:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
