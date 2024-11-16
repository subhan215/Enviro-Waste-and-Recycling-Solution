import { pool } from "../../../../database/database";

export async function POST(req) {
    try {
      const body = await req.json();
      const { chat_id, sender, sender_id, content } = body;
  
      // Validate request body
      if (!chat_id || !sender || !sender_id || !content) {
        return new Response(JSON.stringify({ error: 'All fields are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      // Insert the new message into the database
      const result = await pool.query(
        `INSERT INTO message (chat_id, sender, sender_id, content, is_seen, timestamp)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING *`,
        [chat_id, sender, sender_id, content, false] // false for is_seen by default
      );
  
      const newMessage = result.rows[0];
  
      // Return the new message as the response
      return new Response(JSON.stringify({ message: newMessage }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error inserting message:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  