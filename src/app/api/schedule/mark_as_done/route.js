import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { schedule_id, weights } = await req.json();
        console.log("Schedule ID:", schedule_id);
        console.log("Weights:", weights);

        let rewards = 0;
        for (let i = 0; i < weights.length; i++) {
            rewards += weights[i].rate_per_kg * weights[i].weight;
        }
        console.log("Total Rewards:", rewards);

        // Fetch the user_id for the current schedule
        const current_schedule = await pool.query(
            `SELECT user_id, * FROM schedule WHERE schedule_id = $1`, // Get the full schedule
            [schedule_id]
        );

        if (current_schedule.rows.length === 0) {
            return NextResponse.json(
                { error: "Schedule not found", success: false },
                { status: 404 }
            );
        }

        const current_schedule_user_id = current_schedule.rows[0].user_id;
        console.log("Current Schedule User ID:", current_schedule_user_id);

        // Update user rewards
        const update_rewards = await pool.query(
            `UPDATE "User" SET rewards = rewards + $1 WHERE user_id = $2`,
            [rewards, current_schedule_user_id]
        );

        console.log("Updated Rewards:", update_rewards.rowCount);

        // Update the schedule status
        const update_schedule = await pool.query(
            `UPDATE schedule SET status = $2 WHERE schedule_id = $1 RETURNING *`,
            [schedule_id, "done"]
        );
        console.log("Updated Schedule:", update_schedule.rows[0]);
        const {rows} = await pool.query('SELECT * from schedule join trucks on trucks.truckid = schedule.truck_id')
        console.log(rows[0]) ; 
        // Return the updated schedule and success message to the frontend
        return NextResponse.json({
            message: "Schedule updated successfully",
            success: true,
            updatedSchedule: rows[0], // Send the updated schedule
        });
    } catch (error) {
        console.error("Error updating schedule:", error);
        return NextResponse.json(
            { error: "Internal server error", success: false },
            { status: 500 }
        );
    }
}
