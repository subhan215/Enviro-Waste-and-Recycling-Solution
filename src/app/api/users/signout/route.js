import { pool } from "../../../../database/database";

export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        const current_user = await pool.query(
          'UPDATE "User" SET refresh_token = NULL WHERE user_id = $1 RETURNING user_id, name, email_id, gender, age, mobile, area_id',
          [req.body.user_id]
        );
  
        const options = {
          httpOnly: true,
          secure: true
        };
  
        return res.status(200)
          .clearCookie("access_token", options)
          .clearCookie("refresh_token", options)
          .json({
            success: true,
            data: current_user.rows[0],
            message: "User logged out!"
          });
      } catch (error) {
        console.error("Error during sign out:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error."
        });
      }
    } else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  }