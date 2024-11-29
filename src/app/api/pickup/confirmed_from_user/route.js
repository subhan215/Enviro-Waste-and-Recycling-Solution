import { pool } from "../../../../database/database";
import { NextResponse } from "next/server"; // Import NextResponse

export async function PUT(req) {
    let { missed_pickup_id, userId, newStatus } = await req.json();
    missed_pickup_id = parseInt(missed_pickup_id);
    userId = parseInt(userId);

    // Properly log the variables
    console.log("missed_pickup_id:", missed_pickup_id, "userId:", userId);

    // Begin transaction
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Begin transaction

        // Fetch the missed pickup based on the provided IDs and ensure it's not completed
        const pickup = await client.query(
            "SELECT * FROM missed_pickup WHERE missed_pickup_id = $1 AND user_id = $2 AND status != $3",
            [missed_pickup_id, userId, "completed"]
        );

        // Handle the case where no missed pickup is found
        if (pickup.rows.length === 0) {
            await client.query('ROLLBACK'); // Rollback if no pickup found
            return NextResponse.json({
                success: false,
                message: 'No missed pickup found for the provided IDs',
            }, { status: 400 });
        }

        let updatedStatus = newStatus;

        // Check if the status actually needs updating
        if (!updatedStatus) {
            await client.query('ROLLBACK'); // Rollback if no valid status change
            return NextResponse.json({
                success: false,
                message: 'No valid status change for the missed pickup',
            }, { status: 400 });
        }

        // Update the status in the missed_pickup table
        const updatedPickup = await client.query(
            'UPDATE missed_pickup SET status = $1 WHERE missed_pickup_id = $2 AND user_id = $3 RETURNING *',
            [updatedStatus, missed_pickup_id, userId]
        );

        // Log the updated row
        console.log(updatedPickup.rows[0]);

        // Commit the transaction
        await client.query('COMMIT');

        // Return success response with the updated pickup data
        return NextResponse.json({
            success: true,
            data: updatedPickup.rows[0],
            message: 'Missed pickup updated successfully',
        }, { status: 200 });
    } catch (error) {
        // Rollback the transaction in case of an error
        await client.query('ROLLBACK');
        console.error("Error: ", error);

        // Return error response
        return NextResponse.json({
            success: false,
            message: 'Failed to update missed pickup',
            error: error.message,
        }, { status: 500 });
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
