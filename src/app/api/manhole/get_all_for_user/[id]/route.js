import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = await params;

    try {
        const result = await pool.query(
            `SELECT mr.*, a.name as area_name, c.name as company_name
             FROM manhole_report mr
             LEFT JOIN area a ON mr.area_id = a.area_id
             LEFT JOIN company c ON mr.company_id = c.user_id
             WHERE mr.user_id = $1
             ORDER BY mr.created_at DESC`,
            [id]
        );

        return NextResponse.json({
            success: true,
            data: result.rows,
            message: 'Manhole reports fetched successfully'
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching manhole reports:", error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch manhole reports',
            error: error.message
        }, { status: 500 });
    }
}
