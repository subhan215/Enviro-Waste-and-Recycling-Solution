import { pool } from "../../../../../database/database";

/*export async function GET(req, { params }) {
  const { user_id } = params;

  // Validate input
  if (!user_id) {
    return new Response(JSON.stringify({ message: 'Missing user_id in query' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Query to get companies from the schedule entity
    const scheduleCompaniesQuery = `
      SELECT DISTINCT c.user_id, c.name, c.email_id, c.phone
      FROM schedule s
      INNER JOIN company c ON s.company_id = c.user_id
      WHERE s.user_id = $1;
    `;
    const scheduleCompaniesResult = await pool.query(scheduleCompaniesQuery, [user_id]);

    // Query to get the area of the user and companies managing that area
    const areaCompaniesQuery = `
      SELECT DISTINCT c.user_id, c.name, c.email_id, c.phone
      FROM "User" u
      INNER JOIN area a ON u.area_id = a.area_id
      INNER JOIN company c ON a.company_id = c.user_id
      WHERE u.user_id = $1;
    `;
    const areaCompaniesResult = await pool.query(areaCompaniesQuery, [user_id]);

    // Merge results and remove duplicates based on user_id
    const mergedCompanies = [
      ...areaCompaniesResult.rows,
      ...scheduleCompaniesResult.rows,
    ];

    const uniqueCompanies = Array.from(
      new Map(mergedCompanies.map((company) => [company.user_id, company])).values()
    );

    return new Response(JSON.stringify({ companies: uniqueCompanies }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} */
 // import { pool } from "../../../../../database/database";

  export async function GET(req, { params }) {
    const { user_id } = params;
  
    // Validate input
    if (!user_id) {
      return new Response(JSON.stringify({ message: 'Missing user_id in query' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    try {
      // Query to get companies from the schedule entity
      const scheduleCompaniesQuery = `
        SELECT DISTINCT c.user_id, c.name, c.email_id, c.phone
        FROM schedule s
        INNER JOIN company c ON s.company_id = c.user_id
        WHERE s.user_id = $1;
      `;
      const scheduleCompaniesResult = await pool.query(scheduleCompaniesQuery, [user_id]);
  
      // Query to get the area of the user and companies managing that area
      const areaCompaniesQuery = `
        SELECT DISTINCT c.user_id, c.name, c.email_id, c.phone
        FROM "User" u
        INNER JOIN area a ON u.area_id = a.area_id
        INNER JOIN company c ON a.company_id = c.user_id
        WHERE u.user_id = $1;
      `;
      const areaCompaniesResult = await pool.query(areaCompaniesQuery, [user_id]);
  
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
      const existingReportsResult = await pool.query(companyReportsQuery, [user_id]);
  
      // Get the company IDs that already have unresolved reports
      const unresolvedCompanyIds = existingReportsResult.rows.map((row) => row.company_id);
  
      // Filter companies that do not have unresolved reports
      const filteredCompanies = uniqueCompanies.filter(
        (company) => !unresolvedCompanyIds.includes(company.user_id)
      );
  
      return new Response(JSON.stringify({ companies: filteredCompanies }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error fetching companies:', error);
      return new Response(JSON.stringify({ message: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  