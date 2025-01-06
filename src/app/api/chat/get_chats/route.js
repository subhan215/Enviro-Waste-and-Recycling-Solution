import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req) {
  const client = await pool.connect(); // Start a new client connection for transaction handling
  // Retrieve role and id from query parameters or URL params
  const fullUrl = req.url;

  // Create a URL object to parse the query string
  const url = new URL(fullUrl, `http://${req.headers.host}`);

  // Get query parameters from the URL
  const role = url.searchParams.get('role');
  const id = url.searchParams.get('id');

  try {
    // Begin the transaction
    await client.query('BEGIN');

    // Log for debugging
    console.log('Role:', role); // e.g., 'user'
    console.log('ID:', id); // e.g., some user or company ID

    if (!role || !id) {
      await client.query('ROLLBACK'); // Rollback transaction in case of error
      return NextResponse.json({ message: 'Role and ID are required' }, { status: 400 });
    }

    let chats;

    // Query for user or company chats
    if (role === 'user') {
      const res = await client.query(
        'SELECT * FROM chat ch JOIN company c ON c.user_id = ch.user_id WHERE ch.user_id = $1 ORDER BY created_at DESC',
        [id]
      );
      chats = res.rows;
    } else if (role === 'company') {
      const res = await client.query(
        'SELECT * FROM chat ch JOIN "User" u ON u.user_id = ch.user_id WHERE company_id = $1 ORDER BY created_at DESC',
        [id]
      );
      chats = res.rows;
    } else {
      await client.query('ROLLBACK'); // Rollback transaction if the role is invalid
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    // Commit the transaction after successful query execution
    await client.query('COMMIT');

    // Return the retrieved chat data
    return NextResponse.json(chats, { status: 200 });
  } catch (error) {
    // Rollback the transaction in case of any error
    await client.query('ROLLBACK');
    console.error('Error fetching chats:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release(); // Release the client back to the pool
  }
}
