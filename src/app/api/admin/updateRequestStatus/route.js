import { NextResponse } from 'next/server';
import { pool } from '../../../../database/database';

export async function PUT(request) {
  try {
    // Step 1: Parse the incoming request
    const { request_id, status } = await request.json();
    console.log("request_id: " , request_id)
    // Step 2: Find the request by request_id
    const result = await pool.query(
      'SELECT * FROM request_submit_material WHERE request_id = $1',
      [request_id]
    );
    console.log(result)
    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Request not found.' }, { status: 404 });
    }

    const requestData = result.rows[0];
    
    // Step 3: Get associated user and company
    const userResult = await pool.query(
      `SELECT * FROM "User" WHERE user_id = $1`,
      [requestData.user_id]
    );

    const companyResult = await pool.query(
      'SELECT * FROM company WHERE user_id = $1',
      [requestData.company_id]
    );

    if (userResult.rows.length === 0 || companyResult.rows.length === 0) {
      return NextResponse.json({ message: 'User or company not found.' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const company = companyResult.rows[0];

    // Step 4: Handle the Rejected status
    if (status === 'Rejected') {
      // Send notification to company
      const companyNotification = await pool.query(
        'INSERT INTO notification (content, created_at) VALUES ($1, NOW()) RETURNING *',
        [`The request has been rejected for user id/name: ${user.user_id} / ${user.name}`]
      );
      await pool.query(
        'INSERT INTO notification_company (company_id, notification_id) VALUES ($1, $2)',
        [company.user_id, companyNotification.rows[0].notification_id]
      );
      // Delete the request
      await pool.query(
        'DELETE FROM request_submit_material WHERE request_id = $1',
        [request_id]
      );

      return NextResponse.json({ message: 'Request rejected, notification sent to company.' });

    } else if (status === 'Approved') {
      // Step 5: Calculate total rewards from paper_cardboard_total, plastics_total, metals_total
      const totalRewards = parseFloat(requestData.paper_cardboard_total) + parseFloat(requestData.plastics_total) + parseFloat(requestData.metals_total);

      // Step 6: Add rewards to user's account
      await pool.query(
        'UPDATE "User" SET rewards = rewards + $1 WHERE user_id = $2',
        [totalRewards, user.user_id]
      );

      // Step 7: Send notifications to both user and company
      // Notification to user
      const userNotification = await pool.query(
        'INSERT INTO notification (content, created_at) VALUES ($1, NOW()) RETURNING *',
        ['Your waste submission has been accepted. Rewards have been added.']
      );

      // Notification to company
      const companyNotification = await pool.query(
        'INSERT INTO notification(content, created_at) VALUES ($1, NOW()) RETURNING *',
        [`Your request for user ${user.name} has been accepted.`]
      );

      // Insert into notification_company and notification_user
      await pool.query(
        'INSERT INTO notification_company (company_id, notification_id) VALUES ($1, $2)',
        [company.user_id, companyNotification.rows[0].notification_id]
      );
      
      await pool.query(
        'INSERT INTO notification_user (user_id, notification_id) VALUES ($1, $2)',
        [user.user_id, userNotification.rows[0].notification_id]
      );

      // Step 8: Delete the request
      await pool.query(
        'DELETE FROM request_submit_material WHERE request_id = $1',
        [request_id]
      );

      return NextResponse.json({
        message: 'Request approved, rewards added, notifications sent to both user and company.',
      });

    } else {
      return NextResponse.json({ message: 'Invalid status provided.' }, { status: 400 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong, please try again later.' }, { status: 500 });
  }
}
