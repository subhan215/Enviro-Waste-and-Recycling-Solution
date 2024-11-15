import { pool } from "@/database/database";

export async function PUT(req) {
    console.log("hey")
    try {
        const { requestId, newPrice, company_id } = await req.json();
        const price = newPrice
        console.log(price , requestId , company_id) ; 
        // Input validation
        if (!requestId || !price || !company_id) {
            return new Response(
                JSON.stringify({ message: "All fields are required" }),
                { status: 400 }
            );
        }

        // Update the offered price in the database
        const updateQuery = `
            UPDATE request_for_waste
            SET offered_price = $1, offered_by = $2
            WHERE request_id = $3
            RETURNING request_id, offered_price, offered_by;
        `;

        const result = await pool.query(updateQuery, [price, company_id, requestId]);

        if (result.rowCount === 0) {
            return new Response(
                JSON.stringify({ message: "Request not found or update failed" , success:false}),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, data: result.rows[0] }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating offered price:", error);
        return new Response(
            JSON.stringify({ message: "Internal Server Error" , success: false }),
            { status: 500 }
        );
    }
}
