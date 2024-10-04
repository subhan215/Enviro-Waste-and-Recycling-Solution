const validateEmail = (email)=>{
    //console.log("check mail")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
module.exports = {
    validateEmail
}