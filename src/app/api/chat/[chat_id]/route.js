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
      const messagesResult = await pool.query(
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