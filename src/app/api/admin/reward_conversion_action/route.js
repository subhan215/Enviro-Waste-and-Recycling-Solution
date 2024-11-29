import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  const client = await pool.connect(); // Get the client to start a transaction
  try {
    const { conversionId, status } = await req.json();
    let userId = null;

    // Validate input
    if (!conversionId || !["Approved", "Rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 }
      );
    }

    // Begin transaction
    await client.query('BEGIN');

    if (status === "Approved") {
      // Query to fetch user_id and conversion_amount
      const getUserIdQuery =
        'SELECT user_id, conversion_amount FROM RewardConversions WHERE conversion_id = $1';
      const { rows } = await client.query(getUserIdQuery, [conversionId]);

      if (rows.length === 0) {
        await client.query('ROLLBACK'); // Rollback the transaction if conversion not found
        return NextResponse.json(
          { success: false, message: "Conversion request not found" },
          { status: 404 }
        );
      }

      const { user_id, conversion_amount } = rows[0];
      userId = user_id;

      // Update the user's rewards
      const updateUserRewardsQuery =
        'UPDATE "User" SET rewards = rewards - $1 WHERE user_id = $2';
      await client.query(updateUserRewardsQuery, [conversion_amount, user_id]);
    }

    // Update the conversion request status and mark as unseen
    const updateConversionStatusQuery =
      'UPDATE RewardConversions SET status = $1, isSeen = $2 WHERE conversion_id = $3';
    await client.query(updateConversionStatusQuery, [status, false, conversionId]);

    const notificationMessage = "Your conversion request has been accepted..Please check your account!";
    const notificationIdResult = await client.query(
      'INSERT INTO notification(content) VALUES ($1) RETURNING notification_id',
      [notificationMessage]
    );
    const notificationId = notificationIdResult.rows[0].notification_id;

    await client.query(
      'INSERT INTO notification_user(notification_id, user_id) VALUES ($1, $2)',
      [notificationId, userId]
    );

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json(
      { success: true, message: `Reward conversion ${status.toLowerCase()} successfully` },
      { status: 200 }
    );
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback if there's an error
    console.error("Error updating reward conversion status:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update status" },
      { status: 500 }
    );
  } finally {
    client.release(); // Release the client back to the pool
  }
}
