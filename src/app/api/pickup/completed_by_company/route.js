import { pool } from "../../../../database/database";

export async function PUT(req) {
    let { missed_pickup_id, userId } = await req.json();
    missed_pickup_id = parseInt(missed_pickup_id);
    userId = parseInt(userId);

    // Properly log the variables
    console.log("missed_pickup_id:", missed_pickup_id, "userId:", userId);

    try {
        // Fetch the missed pickup based on the provided IDs and ensure it's not completed
        const pickup = await pool.query(
            "SELECT * FROM missed_pickup WHERE missed_pickup_id = $1 AND company_id = $2 AND status != $3",
            [missed_pickup_id, userId, "completed"]
        );

        // Handle the case where no missed pickup is found
        if (pickup.rows.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'No missed pickup found for the provided IDs',
                }),
                { status: 400 }
            );
        }

        let updatedStatus = "";

        // Update status based on the current status
        if (pickup.rows[0].status === "pending") {
            updatedStatus = "marked completed by company";
        } else if (pickup.rows[0].status === "marked completed by user") {
            updatedStatus = "completed";
        }

        // Update the status in the missed_pickup table
        const updatedPickup = await pool.query(
            'UPDATE missed_pickup SET status = $1 WHERE missed_pickup_id = $2 AND company_id = $3 RETURNING *',
            [updatedStatus, missed_pickup_id, userId]
        );

        // Log the updated row
        console.log(updatedPickup.rows[0]);

        // Return success response with the updated pickup data
        return new Response(
            JSON.stringify({
                success: true,
                data: updatedPickup.rows[0],
                message: 'Missed pickup updated successfully',
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error: ", error);

        // Return error response
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to update missed pickup',
                error: error.message,
            }),
            { status: 500 }
        );
    }
}
