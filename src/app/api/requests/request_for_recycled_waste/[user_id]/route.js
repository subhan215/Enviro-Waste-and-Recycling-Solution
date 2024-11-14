import { pool } from "@/database/database";

export async function GET(req , {params}) {
    try {
        const {user_id} = params
        const userId = user_id
        console.log(userId)
        if (!userId) {
            return new Response(
                JSON.stringify({ error: "User ID is required" }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Query the database for all requests by the user
        const result = await pool.query(
            `SELECT request_id, user_id, weight, latitude, longitude, date, time, offered_price
             FROM request_for_waste WHERE user_id = $1`,
            [userId]
        );
        console.log(result.rows[0])

        if (result.rowCount === 0) {
            return new Response(
                JSON.stringify({ message: "No requests found for this user" }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Respond with the user's requests
        return new Response(
            JSON.stringify({ requests: result.rows[0] }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error("Error fetching requests:", error);
        return new Response(
            JSON.stringify({ message: "Internal Server Error" }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}