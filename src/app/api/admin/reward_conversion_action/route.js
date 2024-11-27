import { pool } from "../../../../database/database";

export async function PATCH(req) {
  try {
    const { conversionId, status } = await req.json();
    let userId = null 
    // Validate input
    if (!conversionId || !["Approved", "Rejected"].includes(status)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid input" }),
        { status: 400 }
      );
    }

    if (status === "Approved") {
      // Query to fetch user_id and conversion_amount
      const getUserIdQuery =
        'SELECT user_id, conversion_amount FROM RewardConversions WHERE conversion_id = $1';
      const { rows } = await pool.query(getUserIdQuery, [conversionId]);

      if (rows.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Conversion request not found",
          }),
          { status: 404 }
        );
      }

      const { user_id, conversion_amount } = rows[0];
      userId = user_id ; 
      // Update the user's rewards
      const updateUserRewardsQuery =
        'UPDATE "User" SET rewards = rewards - $1 WHERE user_id = $2';
      await pool.query(updateUserRewardsQuery, [conversion_amount, user_id]);
    }

    // Update the conversion request status and mark as unseen
    const updateConversionStatusQuery =
      'UPDATE RewardConversions SET status = $1, isSeen = $2 WHERE conversion_id = $3';
    await pool.query(updateConversionStatusQuery, [status, false, conversionId]);
    const notificationMessage = "Your conversion request has been accepted..Please check your account!";
    const notificationIdResult = await pool.query(
        'INSERT INTO notification(content) VALUES ($1) RETURNING notification_id',
        [notificationMessage]
    );
    const notificationId = notificationIdResult.rows[0].notification_id;
    await pool.query(
        'INSERT INTO notification_user(notification_id, user_id) VALUES ($1, $2)',
        [notificationId, userId]
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: `Reward conversion ${status.toLowerCase()} successfully`,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating reward conversion status:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to update status" }),
      { status: 500 }
    );
  }
}
