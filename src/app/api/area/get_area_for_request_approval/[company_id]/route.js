import {pool} from "../../../../../database/database"

export async function GET(req , {params}) {
    try {
        // Extract company_id from the query parameters or request object
        const {company_id} = params

        if (!company_id) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'company_id is required.'
                }),
                {
                    status: 400
                }
            );
        }

        // Query to fetch requests for the specific company
        const result = await pool.query(
            `SELECT area_approval_id, request_for_area_approval.area_id, request_for_area_approval.company_id, status , name
             FROM request_for_area_approval join area on request_for_area_approval.area_id = area.area_id
             WHERE request_for_area_approval.company_id = $1`,
            [company_id]
        );

        // Return the fetched data as a JSON response
        return new Response(
            JSON.stringify({
                success: true,
                data: result.rows,
                message: 'Requests fetched successfully!'
            }),
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("Error fetching requests for area approval: ", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to fetch requests for area approval.',
                error: error.message
            }),
            {
                status: 500
            }
        );
    }
}
