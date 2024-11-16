import { pool } from "../../../../database/database";
export async function GET(req , {params}) {
    const {chat_id} = params
  
    // Input validation
    if (!chat_id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "chat_id is required.",
        }),
        {
          status: 400,
        }
      );
    }
  
    try {
      // Fetch all messages for the given chat_id
      const messagesResult = await pool.query(
        "SELECT message_id, sender_id, content, is_seen, timestamp , sender FROM public.message WHERE chat_id = $1 ORDER BY timestamp ASC",
        [chat_id]
      );
  
      const messages = messagesResult.rows;
  
      if (messages.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            data: [],
            message: "No messages found for the given chat_id.",
          }),
          {
            status: 200,
          }
        );
      }
  
      // Return the list of messages
      return new Response(
        JSON.stringify({
          success: true,
          data: messages,
          message: "Messages retrieved successfully.",
        }),
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to retrieve messages.",
        }),
        {
          status: 500,
        }
      );
    }
  }