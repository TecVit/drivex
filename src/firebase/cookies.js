
// COOKIES
function setCookie(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value || "")}; path=/; SameSite=None; Secure`;
}
    
function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
      }
    }
    return null;
}
    
function deleteCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}
  
function clearCookies() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');  

        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
}
  
export { setCookie, deleteCookie, getCookie, clearCookies };