import { pool } from "../../../../database/database";

export async function POST(req) {
  const { user_id, company_id } = await req.json();

  // Input validation
  if (!user_id || !company_id) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Both user_id and company_id are required.",
      }),
      {
        status: 400,
      }
    );
  }

  try {
    // Check if a chat already exists between the user and the company
    const existingChatResult = await pool.query(
      "SELECT chat_id, created_at, updated_at FROM public.chat WHERE user_id = $1 AND company_id = $2",
      [user_id, company_id]
    );

    if (existingChatResult.rows.length > 0) {
      // If chat already exists, return the existing chat data
      const existingChat = existingChatResult.rows[0];
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            chat_id: existingChat.chat_id,
            created_at: existingChat.created_at,
            updated_at: existingChat.updated_at,
          },
          message: "Chat already exists.",
        }),
        {
          status: 200,
        }
      );
    }

    // Insert new chat record into the database
    const result = await pool.query(
      "INSERT INTO public.chat (user_id, company_id, created_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING chat_id, created_at, updated_at",
      [user_id, company_id]
    );

    const newChat = result.rows[0];

    // Returning success response with chat details
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          chat_id: newChat.chat_id,
          created_at: newChat.created_at,
          updated_at: newChat.updated_at,
        },
        message: "Chat created successfully!",
      }),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error creating chat:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to create chat.",
      }),
      {
        status: 500,
      }
    );
  }
}
