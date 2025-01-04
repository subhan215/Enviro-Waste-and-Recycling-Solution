import { pool } from "../../../../database/database";

// Create a schedule when a user accepts a request
export async function POST(req) {
    const { requestId } = await req.json();

    try {
        // Fetch the request data by ID
        const requestQuery = `
            SELECT user_id, date, time, offered_by, offered_price
            FROM request_for_waste
            WHERE request_id = $1
        `;
        const { rows } = await pool.query(requestQuery, [requestId]);

        if (rows.length === 0) {
            return new Response(
                JSON.stringify({ message: `Request with ID ${requestId} not found.` }),
                { status: 404 }
            );
        }

        // Destructure and validate fetched data
        const { user_id, date, time, offered_by: company_id, offered_price } = rows[0];
        if (!user_id || !date || !time || !company_id || !offered_price) {
            return new Response(
                JSON.stringify({ message: "Incomplete request data. Cannot proceed." }),
                { status: 400 }
            );
        }

        // Begin transaction
        await pool.query('BEGIN');

        // Create a new schedule entry, including the offered price
        const insertScheduleQuery = `
            INSERT INTO schedule (user_id, company_id, truck_id, date, time, status, price)
            VALUES ($1, $2, NULL, $3, $4, $5, $6)
        `;
        await pool.query(insertScheduleQuery, [
            user_id,
            company_id,
            date,
            time,
            'Scheduled',
            offered_price,
        ]);

        // Delete the request after creating the schedule
        const deleteQuery = 'DELETE FROM request_for_waste WHERE request_id = $1';
        await pool.query(deleteQuery, [requestId]);

        // Create a notification
        const notificationMessage =
            "Your offer has been accepted by user and a schedule has been created. Check schedules tab.";
        const notificationIdResult = await pool.query(
            'INSERT INTO notification(content) VALUES ($1) RETURNING notification_id',
            [notificationMessage]
        );

        const notificationId = notificationIdResult.rows[0]?.notification_id;
        if (!notificationId) {
            throw new Error("Failed to create notification.");
        }

        // Link notification to the company
        await pool.query(
            'INSERT INTO notification_company(notification_id, company_id) VALUES ($1, $2)',
            [notificationId, company_id]
        );

        // Commit transaction
        await pool.query('COMMIT');

        return new Response(
            JSON.stringify({ message: `Schedule created successfully for request ID ${requestId}.` }),
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating schedule:", error);

        // Rollback transaction in case of an error
        await pool.query('ROLLBACK');
        return new Response(
            JSON.stringify({ message: "Server error while creating the schedule." }),
            { status: 500 }
        );
    }
}
