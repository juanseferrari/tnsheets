console.log("indexjs")

function checkCookie() {
    var googleUserId = getCookie("google_user_id");
    console.log("checking cookies")
    if (!googleUserId) {
        // Display the button
        console.log("display button")
        document.getElementById("google-sign-in").style.display = "block";
    } else {
        // Hide the button
        console.log("hide button")
        document.getElementById("google-sign-in").style.display = "none";
    }
}

function getCookie(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        console.log(cookie)
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}