const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require("../database/database");


//For checking password
const check_password = async function (existing_pass, input_pass) {
    console.log("In check pass");
    return await bcrypt.compare(input_pass, existing_pass)
}

const generate_access_token = function (user_id,email_id,name){
    return jwt.sign(
        {
            user_id,
            email_id,
            name,
        },
        process.env.ACCESS_TOKEN_SECRET
    )
}
const generate_refresh_token  = function (user_id){
    return jwt.sign(
        {
            user_id,
        },
        process.env.REFRESH_TOKEN_SECRET
    )
}


const generate_access_and_refresh_tokens = async(user_id,email_id,name) => {
    try {
        console.log("in generate tokens")
        const access_token = generate_access_token(user_id,email_id,name)
        const refresh_token = generate_refresh_token(user_id)
        console.log("Access token",access_token)
        console.log("Refresh token",refresh_token)
        await pool.query('update "User" set refresh_token = $1 where user_id = $2' , [refresh_token , user_id])        
        return {access_token , refresh_token}
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Unable to generate tokens"
          });
    }
}


module.exports = 
{
check_password,
generate_access_and_refresh_tokens,
generate_access_token
}