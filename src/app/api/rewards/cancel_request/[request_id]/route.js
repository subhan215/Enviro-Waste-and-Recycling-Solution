import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  const { request_id } = params;

  if (!request_id) {
    return NextResponse.json(
      { message: 'Request ID is required' },
      { status: 400 }
    );
  }

  const client = await pool.connect(); // Get a client for transaction management

  try {
    // Begin transaction
    await client.query("BEGIN");

    // Check if the request ID exists and if it belongs to the user
    const { rows: activeRequest } = await client.query(
      'SELECT * FROM RewardConversions WHERE conversion_id = $1 AND status = $2',
      [request_id, 'Pending']
    );

    if (activeRequest.length === 0) {
      // Rollback transaction if no active request found
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: 'No active request found to cancel' },
        { status: 404 }
      );
    }

    // Proceed with the cancellation process
    const { rowCount } = await client.query(
      'DELETE FROM RewardConversions WHERE conversion_id = $1',
      [request_id]
    );

    if (rowCount === 0) {
      // Rollback transaction if deletion fails
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: 'Failed to cancel the request' },
        { status: 500 }
      );
    }

    // Commit the transaction if everything is successful
    await client.query("COMMIT");

    return NextResponse.json(
      { success: true, message: 'Request canceled successfully' },
      { status: 200 }
    );

  } catch (err) {
    // Rollback transaction in case of an error
    await client.query("ROLLBACK");
    console.error('Error canceling request:', err);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
