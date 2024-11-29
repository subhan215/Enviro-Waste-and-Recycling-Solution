import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { chat_id } = params;

  // Input validation
  if (!chat_id) {
    return NextResponse.json(
      {
        success: false,
        message: "chat_id is required.",
      },
      {
        status: 400,
      }
    );
  }

  const client = await pool.connect(); // Start a new client connection for transaction handling

  try {
    // Begin the transaction
    await client.query('BEGIN');

    // Query to fetch messages based on chat_id
    const messagesResult = await client.query(
      `
      SELECT 
        m.message_id, 
        m.sender_id, 
        m.content, 
        m.is_seen, 
        m.timestamp, 
        m.sender, 
        CASE 
          WHEN m.sender = 'company' THEN c.name 
          WHEN m.sender = 'user' THEN u.name
        END AS sender_name
      FROM 
        public.message m
      LEFT JOIN 
        public.company c ON m.sender = 'company' AND m.sender_id = c.user_id
      LEFT JOIN 
        "User" u ON m.sender = 'user' AND m.sender_id = u.user_id
      WHERE 
        m.chat_id = $1 
      ORDER BY 
        m.timestamp ASC
      `,
      [chat_id]
    );

    const messages = messagesResult.rows;

    // Commit the transaction
    await client.query('COMMIT');

    if (messages.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "No messages found for the given chat_id.",
        },
        {
          status: 200,
        }
      );
    }

    // Return the list of messages
    return NextResponse.json(
      {
        success: true,
        data: messages,
        message: "Messages retrieved successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error("Error fetching messages:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve messages.",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  } finally {
    client.release(); // Release the client back to the pool
  }
}
