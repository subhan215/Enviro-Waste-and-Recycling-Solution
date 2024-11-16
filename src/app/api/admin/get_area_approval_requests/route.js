import { pool } from '../../../../database/database';
export async function GET(req) {

  try {
    // Query to get all area approval requests
    console.log("hello")
    const query = `SELECT area_approval_id, area_id, company_id, status FROM request_for_area_approval`;
    const { rows } = await pool.query(query);

    return new Response(JSON.stringify({ success: true, data: rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching area approval requests:', error);
    return new Response(JSON.stringify({ success: false, message: 'An error occurred while fetching the data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
