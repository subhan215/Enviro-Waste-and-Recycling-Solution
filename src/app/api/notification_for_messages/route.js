const { pool } = require("../../../database/database");

export async function GET(request) {
    try {
      // Extract user_id and role from query parameters
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('id');
      const role = searchParams.get('role');
  
      // Check if both 'id' and 'role' are provided
      if (!userId || !role) {
        return new Response(
          JSON.stringify({ error: 'Missing required query parameters.' }),
          { status: 400 }
        );
      }
  
      let result;
      let query;
  
      // Determine the query based on role (user or company)
      if (role === 'user') {
        query = `
          SELECT nf.notification_id, nf.content, nf.created_at, nf.is_read, nf.chat_id , u.name
          FROM notification_for_new_message nf
          JOIN chat c ON nf.chat_id = c.chat_id join "User" u on u.user_id = c.user_id
          WHERE c.user_id = $1 AND nf.sender != $2
          ORDER BY nf.created_at DESC LIMIT 1
        `;
        result = await pool.query(query, [userId , role]);
      } else if (role === 'company') {
        query = `
          SELECT nf.notification_id, nf.content, nf.created_at, nf.is_read, nf.chat_id , co.name
          FROM notification_for_new_message nf
          JOIN chat c ON nf.chat_id = c.chat_id join company co on co.user_id = c.company_id
          WHERE c.company_id = $1 AND nf.sender != $2
          ORDER BY nf.created_at DESC LIMIT 1
        `;
        result = await pool.query(query, [userId , role]);
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid role provided.' }),
          { status: 400 }
        );
      }
  
      // Return notifications
      return new Response(
        JSON.stringify({
          notifications: result.rows,
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch notifications.' }),
        { status: 500 }
      );
    }
  }