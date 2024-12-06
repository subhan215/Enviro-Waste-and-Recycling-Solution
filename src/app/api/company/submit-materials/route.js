import { pool } from "../../../../database/database"; // Import your PostgreSQL pool
import { writeFile } from "fs/promises";
import { upload_to_cloundiary } from "@/utils/cloudinary"; // Cloudinary upload function
import { NextResponse } from "next/server";

export async function POST(req) {
  const client = await pool.connect(); // Get a client from the pool

  try {
    // Start the transaction
    await client.query('BEGIN');

    // Parse the incoming form data
    const data = await req.formData();
    const userId = data.get('userId');
    const companyId = data.get('companyId');
    const weightsData = JSON.parse(data.get('weightsData')); // Assuming weights data is sent as JSON
    const userImage = data.get('image'); // Image data from form

    // Check if the image is provided
    if (!userImage) {
      return NextResponse.json({ "message": "No image found", success: false });
    }

    // Locally storing the image
    const userImageBuffer = await userImage.arrayBuffer();
    const userImageBufferStream = Buffer.from(userImageBuffer);
    const path = `./public/${userImage.name}`;
    await writeFile(path, userImageBufferStream);

    // Upload the image to Cloudinary
    const uploadedImage = await upload_to_cloundiary(path);
    if (!uploadedImage) {
      return NextResponse.json({ "message": "Unable to upload to Cloudinary", success: false });
    }

    // Map the weightsData to extract the required totals
    const paperCardboardTotal = weightsData.find(item => item.name === "Paper and Cardboard")?.weight *weightsData.find(item => item.name === "Paper and Cardboard")?.rate_per_kg  || 0.00;
    const plasticsTotal = weightsData.find(item => item.name === "Plastics")?.weight * weightsData.find(item => item.name === "Plastics")?.rate_per_kg || 0.00;
    const metalsTotal = weightsData.find(item => item.name === "Metals")?.weight * weightsData.find(item => item.name === "Metals")?.rate_per_kg || 0.00;

    // Insert into the request_submit_material table
    const insertQuery = `
      INSERT INTO request_submit_material (company_id, user_id, status, paper_cardboard_total, plastics_total, metals_total, image_url)
      VALUES ($1, $2, 'Pending', $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [companyId, userId, paperCardboardTotal, plasticsTotal, metalsTotal, uploadedImage.url];
    const insertResult = await client.query(insertQuery, values);

    // Commit the transaction
    await client.query('COMMIT');

    // Respond with success
    return new NextResponse(
      JSON.stringify({
        message: "Request created successfully",
        data: insertResult.rows[0], // Return the created request data
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating request:", error);

    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');

    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
