const validatePassword = (password)=>{
    //console.log("check pass")

    const hasNumber = /[0-9]/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    const containsNumber = hasNumber.test(password);
    const containsSpecialChar = hasSpecialChar.test(password);
    return containsNumber && containsSpecialChar && (password.length>7 && password.length<21)
}

module.exports = {
    validatePassword
}