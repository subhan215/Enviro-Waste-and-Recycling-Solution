function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  
  // Convert value to JSON string
  let cvalueStr = JSON.stringify(cvalue);

  document.cookie = cname + "=" + cvalueStr + ";" + expires + ";path=/";
}

export {setCookie}