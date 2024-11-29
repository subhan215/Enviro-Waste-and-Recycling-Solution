import { writeFile } from "fs/promises";
// import { pool } from "../../../database/database";  // Assuming pool is needed for transaction, but it's commented out in your code.
import { upload_to_cloundiary } from "../../../utils/cloudinary";
import { NextResponse } from "next/server";
import * as geminiAi from "../../../utils/geminiAi";

export async function POST(req) {
  const client = await pool.connect(); // Get a client for transaction management

  try {
    console.log("Here");
    const data = await req.formData();
    const clean_or_unclean_image = data.get('clean_or_unclean_image');
    
    if (!clean_or_unclean_image) {
      return NextResponse.json({ "message": "No image found", success: false });
    }

    const clean_or_unclean_image_buffer = await clean_or_unclean_image.arrayBuffer();
    const clean_or_unclean_image_buffer_stream = Buffer.from(clean_or_unclean_image_buffer);
    const path = `./public/${clean_or_unclean_image.name}`;
    
    // Write the file to the local directory
    await writeFile(path, clean_or_unclean_image_buffer_stream);

    // Begin transaction
    await client.query("BEGIN");

    // Process the image using Gemini AI
    const clean_or_unclean = await geminiAi.clean_or_unclean(path);
    const clean_or_unclean_fin = clean_or_unclean
      .split("\n") // Split the string into lines
      .filter(line => line.trim() !== ""); // Remove empty lines    

    console.log(typeof (clean_or_unclean_fin[0]));

    // Upload the image to Cloudinary
    const upload_clean_or_unclean_image_to_cloud = await upload_to_cloundiary(path);
    
    if (!upload_clean_or_unclean_image_to_cloud) {
      // If upload fails, rollback the transaction
      await client.query("ROLLBACK");
      return NextResponse.json({ "message": "Unable to upload to Cloudinary", success: false });
    }

    // Commit the transaction after successful processing
    await client.query("COMMIT");

    // Function to convert the string data into numbers
    function convertToNumbers(data) {
      const splitData = data.trim().split(' ');
      const numbers = splitData.map(Number);
      return numbers;
    }

    // Convert the clean or unclean data to numbers
    const numbers = convertToNumbers(clean_or_unclean);
    console.log(numbers); 

    return NextResponse.json({ "message": "File uploaded", data: numbers, success: true });

  } catch (error) {
    // In case of any error, rollback the transaction and log the error
    await client.query("ROLLBACK");
    console.error("Error processing the file:", error);

    return NextResponse.json({ "message": "Internal Server Error", success: false });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}
