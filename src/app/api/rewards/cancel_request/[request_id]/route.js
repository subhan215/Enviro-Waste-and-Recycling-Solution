import { pool } from "../../../../../database/database"

export async function DELETE(req, { params }) {
  const { request_id } = params

  if (!request_id) {
    return new Response(
      JSON.stringify({ message: 'Request ID is required' }),
      { status: 400 }
    );
  }

  try {
    // Check if the request ID exists and if it belongs to the user
    const { rows: activeRequest } = await pool.query(
      'SELECT * FROM RewardConversions WHERE conversion_id = $1 AND status = $2',
      [request_id, 'Pending']
    );

    if (activeRequest.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active request found to cancel' }),
        { status: 404 }
      );
    }

    // Proceed with the cancellation process
    const { rowCount } = await pool.query(
      'DELETE FROM RewardConversions WHERE conversion_id = $1',
      [request_id]
    );

    if (rowCount === 0) {
      return new Response(
        JSON.stringify({ message: 'Failed to cancel the request' }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Request canceled successfully' }),
      { status: 200 }
    );

  } catch (err) {
    console.error('Error canceling request:', err);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
