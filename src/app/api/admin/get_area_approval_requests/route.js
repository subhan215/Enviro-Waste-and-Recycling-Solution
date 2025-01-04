import { pool } from '../../../../database/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Begin transaction
    await pool.query('BEGIN');

    // Query to get all area approval requests
    console.log("hello");
    const query = `SELECT area_approval_id, area.area_id, request_for_area_approval.company_id, status, area.name , company.name as company_name
                   FROM request_for_area_approval join area on area.area_id = request_for_area_approval.area_id
                   JOIN company 
                   ON company.user_id = request_for_area_approval.company_id`;
    const { rows } = await pool.query(query);

    // Commit transaction
    await pool.query('COMMIT');

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    // Rollback transaction in case of an error
    await pool.query('ROLLBACK');
    console.error('Error fetching area approval requests:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching the data',
    }, {
      status: 500,
    });
  }
}
