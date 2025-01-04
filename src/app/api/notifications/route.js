import { NextResponse } from "next/server";
import { pool } from "../../../database/database";

export async function GET(request) {
  const client = await pool.connect(); // Acquire a client from the pool

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const id = searchParams.get('id'); // User or company ID

  if (!role || !id) {
    return NextResponse.json({ error: 'Role and ID are required.' }, { status: 400 });
  }

  try {
    // Start transaction
    await client.query('BEGIN');

    let query;
    if (role === 'user') {
      query = `
        SELECT n.notification_id, n.content, n.created_at
        FROM notification n
        JOIN notification_user nu ON n.notification_id = nu.notification_id
        WHERE nu.user_id = $1
        ORDER BY n.created_at DESC;
      `;
    } else if (role === 'company') {
      query = `
        SELECT n.notification_id, n.content, n.created_at
        FROM notification n
        JOIN notification_company nc ON n.notification_id = nc.notification_id
        WHERE nc.company_id = $1
        ORDER BY n.created_at DESC;
      `;
    } else {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    // Execute the query
    const result = await client.query(query, [id]);

    // Commit the transaction
    await client.query('COMMIT');

    // Return the notifications
    return NextResponse.json({ notifications: result.rows });
  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');
    console.error('Error fetching notifications:', error);

    // Return an error response
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
