import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { user_id } = params;

  // Validate input
  if (!user_id) {
    return NextResponse.json(
      { message: 'Missing user_id in query' },
      { status: 400 }
    );
  }

  const client = await pool.connect(); // Get a client for the transaction
  try {
    // Begin the transaction
    await client.query('BEGIN');

    // Query to get companies from the schedule entity
    const scheduleCompaniesQuery = `
      SELECT DISTINCT c.user_id, c.name, c.email_id, c.phone
      FROM schedule s
      INNER JOIN company c ON s.company_id = c.user_id
      WHERE s.user_id = $1;
    `;
    const scheduleCompaniesResult = await client.query(scheduleCompaniesQuery, [user_id]);

    // Query to get the area of the user and companies managing that area
    const areaCompaniesQuery = `
      SELECT DISTINCT c.user_id, c.name, c.email_id, c.phone
      FROM "User" u
      INNER JOIN area a ON u.area_id = a.area_id
      INNER JOIN company c ON a.company_id = c.user_id
      WHERE u.user_id = $1;
    `;
    const areaCompaniesResult = await client.query(areaCompaniesQuery, [user_id]);

    // Merge results and remove duplicates based on user_id
    const mergedCompanies = [
      ...areaCompaniesResult.rows,
      ...scheduleCompaniesResult.rows,
    ];

    const uniqueCompanies = Array.from(
      new Map(mergedCompanies.map((company) => [company.user_id, company])).values()
    );

    // Query to filter out companies that already have unresolved reports
    const companyReportsQuery = `
      SELECT company_id
      FROM reports
      WHERE user_id = $1
      AND (status IS NULL OR status != TRUE)
    `;
    const existingReportsResult = await client.query(companyReportsQuery, [user_id]);

    // Get the company IDs that already have unresolved reports
    const unresolvedCompanyIds = existingReportsResult.rows.map((row) => row.company_id);

    // Filter companies that do not have unresolved reports
    const filteredCompanies = uniqueCompanies.filter(
      (company) => !unresolvedCompanyIds.includes(company.user_id)
    );

    // Commit the transaction
    await client.query('COMMIT');

    return NextResponse.json(
      { companies: filteredCompanies },
      { status: 200 }
    );

  } catch (error) {
    // Rollback the transaction if an error occurs
    await client.query('ROLLBACK');
    console.error('Error fetching companies:', error);

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
