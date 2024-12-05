import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { user_id } = params;

  // Validate input
  if (!user_id) {
    return NextResponse.json({ message: 'Missing user_id in query' }, { status: 400 });
  }

  const client = await pool.connect(); // Get a client for transaction management

  try {
    // Begin the transaction
    await client.query('BEGIN');

    // Query to get reports with messages from the reports table
    const getMessagesQuery = `
      SELECT r.message, c.name , r.report_id
      FROM reports r
      JOIN company c ON c.user_id = r.company_id
      WHERE r.user_id = $1 AND (r.message IS NOT NULL AND r.message != '') AND r.status!=true
      ORDER BY r.report_id DESC LIMIT 5;
    `;

    const messagesResult = await client.query(getMessagesQuery, [user_id]);

    // Commit the transaction
    await client.query('COMMIT');

    // Check if any messages were found
    if (messagesResult.rows.length === 0) {
      return NextResponse.json({ message: 'No messages found.' }, { status: 404 });
    }

    // Return the fetched messages
    return NextResponse.json({
      messages: messagesResult.rows
    }, { status: 200 });

  } catch (error) {
    // Rollback the transaction if an error occurs
    await client.query('ROLLBACK');
    console.error('Error fetching report messages:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
