import { pool } from "../../../../../database/database";


export async function DELETE(req , {params}) {
    console.log(params)
    const { request_id } = params;

        try {
            const deleteQuery = 'DELETE FROM request_for_waste WHERE request_id = $1';
            const result = await pool.query(deleteQuery, [request_id]);
            console.log("deleting successfully!" , result)
            if (result.rowCount > 0) {
                return new Response(JSON.stringify({ message: `Request with ID ${request_id} deleted seccuessfully!`  , success:true}), 
                { status: 200 });
            } else {
                return new Response(JSON.stringify({ message: `Request with ID ${request_id} not found!`  , success:false}), 
                { status: 400 });
            }
        } catch (error) {
            console.error('Error deleting request:', error);
            return new Response(JSON.stringify({ message: `Some error occured!!` ,  success:false}), 
                { status: 505 });
        } 
}