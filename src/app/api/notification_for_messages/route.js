import { pool } from "../../../database/database";
import { NextResponse } from "next/server";

export async function GET(request) {
  const client = await pool.connect();

  try {
    // Extract user_id and role from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const role = searchParams.get('role');

    // Check if both 'id' and 'role' are provided
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing required query parameters.' },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query('BEGIN');

    let result;
    let query;

    // Determine the query based on role (user or company)
    if (role === 'user') {
      query = `
        SELECT nf.notification_id, nf.content, nf.created_at, nf.is_read, nf.chat_id, u.name
        FROM notification_for_new_message nf
        JOIN chat c ON nf.chat_id = c.chat_id
        JOIN "User" u ON u.user_id = c.user_id
        WHERE c.user_id = $1 AND nf.sender != $2
        ORDER BY nf.created_at DESC LIMIT 1
      `;
      result = await client.query(query, [userId, role]);
    } else if (role === 'company') {
      query = `
        SELECT nf.notification_id, nf.content, nf.created_at, nf.is_read, nf.chat_id, co.name
        FROM notification_for_new_message nf
        JOIN chat c ON nf.chat_id = c.chat_id
        JOIN company co ON co.user_id = c.company_id
        WHERE c.company_id = $1 AND nf.sender != $2
        ORDER BY nf.created_at DESC LIMIT 1
      `;
      result = await client.query(query, [userId, role]);
    } else {
      return NextResponse.json(
        { error: 'Invalid role provided.' },
        { status: 400 }
      );
    }

    // Commit the transaction
    await client.query('COMMIT');

    // Return notifications
    return NextResponse.json(
      { notifications: result.rows },
      { status: 200 }
    );
  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');
    console.error('Error fetching notifications:', error);

    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch notifications.' },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
