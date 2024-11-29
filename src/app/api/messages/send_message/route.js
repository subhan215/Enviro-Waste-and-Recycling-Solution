import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { chat_id, sender, sender_id, content, sender_name } = body;
    console.log(body);

    // Validate request body
    if (!chat_id || !sender || !sender_id || !content || !sender_name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query('BEGIN');

    // Insert the new message into the database
    const messageResult = await client.query(
      `INSERT INTO message (chat_id, content, is_seen, timestamp , sender_id , sender)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP , $4 , $5)
       RETURNING *`,
      [chat_id, content, false, sender_id, sender] // false for is_seen by default
    );

    const newMessage = messageResult.rows[0];

    // Create a notification for the new message
    const notificationResult = await client.query(
      `INSERT INTO notification_for_new_message (content, chat_id, created_at, is_read , sender)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3 , $4)
       RETURNING *`,
      [content, chat_id, false, sender] // false for is_read by default
    );
    const newNotification = notificationResult.rows[0];

    // Commit the transaction
    await client.query('COMMIT');

    // Return the new message and notification as the response
    return NextResponse.json(
      {
        message: newMessage,
        notification: newNotification,
      },
      { status: 201 }
    );
  } catch (error) {
    // Rollback the transaction if any error occurs
    await client.query('ROLLBACK');
    console.error("Error sending message:", error);

    // Return error response
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
