import { pool } from "../../../../database/database";
import { NextResponse } from "next/server";

// API endpoint to approve area requests
export async function POST(req) {

  const { areaApprovalId } = await req.json();

  if (!areaApprovalId) {
    return NextResponse.json(
      { success: false, message: 'Area approval ID is required' },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query('BEGIN');

    // Retrieve the request_for_area_approval record (now includes service_type)
    const requestQuery = `SELECT area_id, company_id, service_type FROM request_for_area_approval WHERE area_approval_id = $1`;
    const { rows } = await client.query(requestQuery, [areaApprovalId]);

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, message: 'Area approval request not found' },
        { status: 404 }
      );
    }

    const { area_id, company_id, service_type } = rows[0];

    // Delete the request_for_area_approval record
    const deleteQuery = `DELETE FROM request_for_area_approval WHERE area_approval_id = $1`;
    await client.query(deleteQuery, [areaApprovalId]);

    // Insert into area_service_assignment table
    await client.query(
      `INSERT INTO area_service_assignment (area_id, company_id, service_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (area_id, company_id, service_type) DO NOTHING`,
      [area_id, company_id, service_type || 'waste_collection']
    );

    // For backward compatibility, also update area.company_id for waste_collection
    if (service_type === 'waste_collection' || !service_type) {
      const assignCompanyQuery = `UPDATE area SET company_id = $1 WHERE area_id = $2`;
      await client.query(assignCompanyQuery, [company_id, area_id]);
    }

    const serviceTypeLabel = service_type === 'manhole_management' ? 'Manhole Management' :
                             service_type === 'recycling' ? 'Recycling' : 'Waste Collection';
    const notificationMessage = `Your area request for ${serviceTypeLabel} has been approved!`;
    const notificationIdResult = await client.query(
        'INSERT INTO notification(content) VALUES ($1) RETURNING notification_id',
        [notificationMessage]
    );

    const notificationId = notificationIdResult.rows[0].notification_id;
    await client.query(
        'INSERT INTO notification_company(notification_id, company_id) VALUES ($1, $2)',
        [notificationId, company_id]
    );

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json(
      { success: true, message: `Area approved for ${serviceTypeLabel} successfully` },
      { status: 200 }
    );
  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error approving area:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while processing the request' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
