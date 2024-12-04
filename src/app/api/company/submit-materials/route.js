import { NextResponse } from "next/server";
import { pool } from "../../../../database/database"; // Import your PostgreSQL pool
export async function POST(req) {
  const client = await pool.connect(); // Get a client from the pool

  try {
    // Start the transaction
    await client.query('BEGIN');

    // Parse the incoming JSON body
    const { userId, weightsData } = await req.json();
    console.log(userId , weightsData);
    // Query to check if the user exists
    const userCheckQuery = `SELECT * FROM "User" WHERE user_id = $1`;
    const userCheckResult = await client.query(userCheckQuery, [userId]);

    // If the user is not found, return an error response
    if (userCheckResult.rows.length === 0) {
      await client.query('ROLLBACK'); // Rollback transaction if user is not found
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }

    // Calculate rewards based on the weights and rates
    let rewards = 0;
    for (let i = 0; i < weightsData.length; i++) {
      rewards += weightsData[i].rate_per_kg * weightsData[i].weight;
    }
    console.log("Total Rewards:", rewards);

    // Query to update the user's rewards
    const updateQuery = `
      UPDATE "User"
      SET rewards = rewards + $1
      WHERE user_id = $2
      RETURNING *;
    `;
    const updateResult = await client.query(updateQuery, [rewards, userId]);

    // Commit the transaction
    await client.query('COMMIT');

    // Respond with success
    return new NextResponse(
      JSON.stringify({
        message: "Materials updated successfully",
        data: updateResult.rows[0], // Return the updated user data
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting materials:", error);

    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');

    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
