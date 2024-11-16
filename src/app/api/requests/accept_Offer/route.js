import { pool } from "../../../../database/database";
// Create a schedule when a user accepts a request
export async function POST(req, { params }) {
    const { requestId } = await req.json();

    try {
        // Fetch the request data by ID
        const requestQuery = `
            SELECT user_id, date, time, offered_by, offered_price
            FROM request_for_waste
            WHERE request_id = $1
        `;
        const { rows } = await pool.query(requestQuery, [requestId]);

        if (rows.length === 0) {
            return new Response(JSON.stringify({ message: `Request with ID ${requestId} not found.` }), { status: 404 });
        }

        const { user_id, date, time, offered_by: company_id, offered_price } = rows[0];

        // Create a new schedule entry, including the offered price
        const insertScheduleQuery = `
            INSERT INTO schedule (user_id, company_id, truck_id, date, time, status, price)
            VALUES ($1, $2, NULL, $3, $4, $5, $6)
        `;
        await pool.query(insertScheduleQuery, [user_id, company_id,  date, time, 'Scheduled', offered_price]);

        const deleteQuery = 'DELETE FROM request_for_waste WHERE request_id = $1';
        const result = await pool.query(deleteQuery, [requestId]);
        console.log("deleting successfully!" , result)



        return new Response(JSON.stringify({ message: `Schedule created successfully for request ID ${requestId}.` }), { status: 201 });
    } catch (error) {
        console.error('Error creating schedule:', error);
        return new Response(JSON.stringify({ message: 'Server error while creating the schedule.' }), { status: 500 });
    }
}
