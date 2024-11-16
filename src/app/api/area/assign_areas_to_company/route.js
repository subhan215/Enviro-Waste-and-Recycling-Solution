import { pool } from "../../../../database/database";

export async function POST(req) {
    const { selectedAreas, company_id } = await req.json();
    console.log("Selected Areas: ", selectedAreas);

    try {
        // Begin a database transaction
        await pool.query('BEGIN');

        // Loop through the selected areas and insert each one into the database
        for (const area_id of selectedAreas) {
            await pool.query(
                `INSERT INTO request_for_area_approval (area_id, company_id, status) 
                 VALUES ($1, $2, $3)`,
                [area_id, company_id, 'pending']
            );
        }

        // Commit the transaction
        await pool.query('COMMIT');

        return new Response(
            JSON.stringify({
                success: true,
                message: 'request has been created for areas approval!',
            }),
            {
                status: 200
            }
        );
    } catch (error) {
        // Rollback the transaction in case of an error
        await pool.query('ROLLBACK');
        console.error("Error creating request for area approval: ", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to create request for area approval.',
                error: error.message
            }),
            {
                status: 500
            }
        );
    }
}
