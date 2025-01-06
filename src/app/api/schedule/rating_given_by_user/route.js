import { NextResponse } from "next/server";
import { pool } from "../../../../database/database";

export async function POST(req) {
    const client = await pool.connect();

    try {
        let { rating, schedule_id } = await req.json();
        rating = parseFloat(rating);

        // Begin the transaction
        await client.query("BEGIN");

        // Get company_id from the schedule
        const get_company_id = await client.query(
            `SELECT company_id FROM schedule WHERE schedule_id = $1`,
            [schedule_id]
        );

        if (!get_company_id.rows.length) {
            // Rollback the transaction if schedule is not found
            await client.query("ROLLBACK");
            return NextResponse.json({ message: "Schedule not found.", success: false });
        }

        const company_id = get_company_id.rows[0].company_id;
        console.log("Company id by schedule:", company_id);

        // Get the current avg_rating from the company table
        const get_comp_rat = await client.query(
            `SELECT avg_rating, total_recycled_pickups FROM company WHERE user_id = $1`,
            [company_id]
        );

        if (!get_comp_rat.rows.length) {
            // Rollback the transaction if company is not found
            await client.query("ROLLBACK");
            return NextResponse.json({ message: "Company not found.", success: false });
        }

        let avg_rating = get_comp_rat.rows[0].avg_rating;
        let total_recycled_pickups = get_comp_rat.rows[0].total_recycled_pickups;

        // Update the average rating
        let new_avg_rating;
        if (avg_rating === 0) {
            new_avg_rating = rating; // If there was no previous rating, the new rating becomes the average
        } else {
            console.log("Current Avg rating:", avg_rating);
            console.log("New rating:", rating);

            // Calculate the new average based on all previous ratings
            new_avg_rating = (avg_rating * total_recycled_pickups + rating) / (total_recycled_pickups + 1);
            console.log("New Avg rating:", new_avg_rating);
        }

        // Update the average rating and increment total_recycled_pickups
        await client.query(
            `UPDATE company 
             SET avg_rating = $1, total_recycled_pickups = total_recycled_pickups + 1 
             WHERE user_id = $2`,
            [new_avg_rating, company_id]
        );

        // Check if the company meets the condition to delete the agreement
        if (total_recycled_pickups + 1 > 20 && new_avg_rating < 2.5) {
            await client.query(`DELETE FROM agreement WHERE company_id = $1`, [company_id]);
            console.log("Agreement deleted due to low rating and high recycled pickups.");
        }

        // Delete the schedule
        await client.query(
          'UPDATE schedule set status = $2 WHERE schedule_id = $1',
            [schedule_id , 'completed']
        );

        // Commit the transaction
        await client.query("COMMIT");

        return NextResponse.json({
            message: "Schedule deleted + rating updated",
            success: true
        });
    } catch (error) {
        // Rollback the transaction in case of an error
        await client.query("ROLLBACK");
        console.error("Error updating schedule:", error);

        return NextResponse.json(
            { error: "Internal server error", success: false },
            { status: 500 }
        );
    } finally {
        // Release the client back to the pool
        client.release();
    }
}
