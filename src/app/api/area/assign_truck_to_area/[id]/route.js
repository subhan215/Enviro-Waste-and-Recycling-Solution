import { pool } from "../../../../../database/database";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
    console.log("route hit!", params.id);
    const { truck_data } = await req.json();
    console.log(truck_data);
    let truck = null;
    const client = await pool.connect(); // Start a transaction with a client
    try {
        const companyId = parseInt(params.id); // Convert params.id to an integer

        // Begin transaction
        await client.query('BEGIN');

        // Check if the truck already exists
        truck = await client.query(
            'SELECT * FROM trucks WHERE licenseplate = $1',
            [truck_data.licensePlate]
        );
        if (truck.rows[0]) {
            await client.query('ROLLBACK'); // Rollback transaction if truck exists
            return NextResponse.json(
                {
                    success: false,
                    message: 'Truck with the given license plate already exists!',
                },
                {
                    status: 500
                }
            );
        }

        // Insert the new truck into the database
        const result = await client.query(
            'INSERT INTO trucks (companyid, licenseplate, capacity, area_id) VALUES ($1, $2, $3, $4) RETURNING truckid, companyid, licenseplate, capacity, area_id',
            [companyId, truck_data.licensePlate, parseFloat(truck_data.capacity), parseInt(truck_data.area_id)]
        );

        // Commit the transaction
        if (result.rows[0]) {
            await client.query('COMMIT');
            return NextResponse.json(
                {
                    success: true,
                    message: 'Truck entity created and assigned to area!',
                },
                {
                    status: 200
                }
            );
        } else {
            await client.query('ROLLBACK'); // Rollback transaction if insertion fails
            return NextResponse.json(
                {
                    success: false,
                    message: 'Error assigning truck to area!',
                },
                {
                    status: 500
                }
            );
        }

    } catch (error) {
        await client.query('ROLLBACK'); // Rollback transaction in case of an error
        console.log("Err:", error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error assigning truck to area!',
            },
            {
                status: 500
            }
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
}
