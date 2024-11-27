import { NextResponse } from "next/server";
import { pool } from "../../../../../database/database";

export async function GET(req, { params }) {
    let { user_id } = params;
    user_id = parseInt(user_id);

    console.log("User ID:", user_id);

    try {
        // Query with JOIN to fetch reports along with company details
        const user_report_q = await pool.query(
            `SELECT r.*, c.name , c.email_id, c.phone
             FROM reports r
             INNER JOIN company c ON r.company_id = c.user_id
             WHERE r.user_id = $1 AND (r.status != true OR r.status is null)
             ORDER BY r.report_id DESC`,
            [user_id]
        );

        console.log("Report query length:", user_report_q.rows.length);

        if (user_report_q.rows.length !== 0) {
            return NextResponse.json({
                message: "User reports fetched",
                data: user_report_q.rows,
                success: true,
            });
        } else {
            return NextResponse.json({
                message: "User doesn't have any reports!",
                success: true,
            });
        }
    } catch (error) {
        console.error("Error fetching user reports:", error);
        return NextResponse.json({
            message: "Internal server error",
            success: false,
        });
    }
}
