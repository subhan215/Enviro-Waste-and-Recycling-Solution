import {pool} from "../../../../../database/database"
export async function GET(req, { params }) {
  const { user_id } = params;

  // Validate input
  if (!user_id) {
    return new Response(JSON.stringify({ message: 'Missing user_id in query' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Query to get reports with messages from the reports table
    const getMessagesQuery = `
      SELECT r.message , c.name
      FROM reports r join company c on c.user_id = r.company_id
      WHERE r.user_id = $1 AND r.message IS NOT NULL AND r.message != ''
      ORDER BY r.report_id DESC LIMIT 5;
    `;
    
    const messagesResult = await pool.query(getMessagesQuery, [user_id]);

    // Check if any messages were found
    if (messagesResult.rows.length === 0) {
      return new Response(JSON.stringify({ message: 'No messages found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return the fetched messages
    return new Response(JSON.stringify({
      messages: messagesResult.rows
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching report messages:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
