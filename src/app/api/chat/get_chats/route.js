import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req) {
  const client = await pool.connect(); // Start a new client connection for transaction handling

  try {
    // Begin the transaction
    await client.query('BEGIN');

    // Get query parameters from the URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const searchParams = url.searchParams;

    const role = searchParams.get('role');
    const id = searchParams.get('id');

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
      // If role is user, filter by user_id
      const res = await client.query(
        'SELECT * FROM chat ch JOIN company c ON c.user_id = ch.user_id WHERE ch.user_id = $1 ORDER BY created_at DESC',
        [id]
      );
      chats = res.rows;
    } else if (role === 'company') {
      // If role is company, filter by company_id
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
