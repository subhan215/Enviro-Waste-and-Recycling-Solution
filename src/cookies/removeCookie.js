function removeCookie(cname) {
    const d = new Date();
    // Set the expiration date to a past date to remove the cookie
    d.setTime(d.getTime() - (24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=;" + expires + ";path=/";
}
export { removeCookie };

