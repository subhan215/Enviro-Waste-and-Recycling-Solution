import { NextResponse } from "next/server";
import { pool } from "../../../../../database/database";
export async function PUT(request, { params }) {
  const { truckId } = params; // Getting the truckId from the URL
  const { licenseplate, capacity} = await request.json(); // Getting updated truck data
  console.log(licenseplate)
  // Validate input
  if (!licenseplate || !capacity) {
    return NextResponse.json(
      { message: 'All fields are required' },
      { status: 400 }
    );
  }

  try {
    // SQL query to update truck information
    const query = `
      UPDATE trucks
      SET licenseplate = $1, capacity = $2
      WHERE truckid = $3
      RETURNING *;
    `;
    
    const values = [licenseplate, capacity, truckId];

    // Execute the query
    const { rows } = await pool.query(query, values);

    // If the truck was updated, return the updated truck data
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Truck not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Truck updated successfully', data: rows[0] });
  } catch (error) {
    console.error('Error updating truck:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
