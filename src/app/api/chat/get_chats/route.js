import { pool } from "../../../../database/database";


export async function GET(req, { params, query }) {
  try {
    // Retrieve role and id from query parameters or URL params
    const fullUrl = req.url;

  // Create a URL object to parse the query string
  const url = new URL(fullUrl, `http://${req.headers.host}`);

  // Get query parameters from the URL
  const role = url.searchParams.get('role');
  const id = url.searchParams.get('id');

  // Log for debugging
  console.log('Role:', role); // e.g., 'user'
  console.log('ID:', id); // e.g.,

    if (!role || !id) {
      return new Response(JSON.stringify({ message: 'Role and ID are required' }), { status: 400 });
    }

    let chats;

    // Query for user or company chats
    if (role === 'user') {
      // If role is user, filter by user_id
      const res = await pool.query('SELECT * FROM chat ch join company c on c.user_id = ch.user_id WHERE ch.user_id = $1 ORDER BY created_at DESC', [id]);
      chats = res.rows;
    } else if (role === 'company') {
      // If role is company, filter by company_id
      const res = await pool.query('SELECT * FROM chat ch join "User" u on u.user_id = ch.user_id  WHERE company_id = $1 ORDER BY created_at DESC', [id]);
      chats = res.rows;
    } else {
      return new Response(JSON.stringify({ message: 'Invalid role' }), { status: 400 });
    }

    // Return the retrieved chat data
    return new Response(JSON.stringify(chats), { status: 200 });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}
