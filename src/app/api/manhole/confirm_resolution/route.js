import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

export async function PUT(req) {
    const { report_id, user_id, new_status } = await req.json();

    // Validate status
    const validStatuses = ['confirmed', 'assigned']; // confirmed = user accepts, assigned = user rejects (back to assigned)
    if (!validStatuses.includes(new_status)) {
        return NextResponse.json({
            success: false,
            message: 'Invalid status'
        }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE manhole_report
             SET status = $1
             WHERE report_id = $2 AND user_id = $3
             RETURNING *`,
            [new_status, report_id, user_id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({
                success: false,
                message: 'Manhole report not found'
            }, { status: 404 });
        }

        // If user confirms, send notification to company
        if (new_status === 'confirmed') {
            const companyId = result.rows[0].company_id;
            if (companyId) {
                const notificationMessage = "User has confirmed the manhole resolution.";
                const notificationIdResult = await client.query(
                    'INSERT INTO notification(content) VALUES ($1) RETURNING notification_id',
                    [notificationMessage]
                );
                const notificationId = notificationIdResult.rows[0].notification_id;
                await client.query(
                    'INSERT INTO notification_company(notification_id, company_id) VALUES ($1, $2)',
                    [notificationId, companyId]
                );
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            data: result.rows[0],
            message: 'Manhole report status updated'
        }, { status: 200 });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating manhole report:", error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update manhole report',
            error: error.message
        }, { status: 500 });
    } finally {
        client.release();
    }
}
