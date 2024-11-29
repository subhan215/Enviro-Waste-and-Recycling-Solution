import { NextResponse } from 'next/server';
import { pool } from '../../../../database/database';

export async function GET() {
    try {
        // Begin transaction
        await pool.query('BEGIN');

        // Query to get all companies
        const result = await pool.query('SELECT * FROM company');
        const companies = result.rows;

        // Commit transaction
        await pool.query('COMMIT');

        if (companies.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No companies found.' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: companies },
            { status: 200 }
        );
    } catch (error) {
        // Rollback transaction in case of an error
        await pool.query('ROLLBACK');

        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while fetching companies.' },
            { status: 500 }
        );
    }
}
