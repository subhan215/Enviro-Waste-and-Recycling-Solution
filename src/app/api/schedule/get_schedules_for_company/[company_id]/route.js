const { pool } = require("../../../../../database/database");

export async function GET(req, { params }) {
    const { company_id } = params;
    console.log(company_id);
    if (!company_id) {
        return new Response(JSON.stringify({ message: 'Company ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        // Query to fetch schedules based on company_id
        const query = `
            SELECT *
            FROM schedule
            WHERE company_id = $1;
        `;

        const { rows } = await pool.query(query, [company_id]);

        if (rows.length === 0) {
            return new Response(JSON.stringify({ message: 'No schedules found for this company' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}