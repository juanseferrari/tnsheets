
function checkCookie() {
    var googleUserId = getCookie("google_user_id");
    if (!googleUserId) {
        // Display the button
        document.getElementById("google-sign-in").style.display = "block"; 
    } else {
        // Hide the button
        document.getElementById("google-sign-in").style.display = "none";
    }
}
function setCookie(cookieName, cookieValue, expirationDays) {
    var d = new Date();
    d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

// Function to get a cookie value by name
function getCookie(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}

function scrollManagement(){
    const navbarHeight = document.getElementsByClassName('navbar')[0].offsetHeight
    console.log("navbarHeight")
    console.log(navbarHeight)
    console.log("navbarHeight")
    const contacto = document.getElementById("contacto");
    contacto.scrollTop = navbarHeight

}
scrollManagement()

const loginButton = document.getElementById('login-button')
const googleSignIn = document.getElementById('google-sign-in')
const loginButton2 = document.getElementsByClassName('validation-button')

loginButton.addEventListener('click', () => {
    googleSignIn.style.visibility = "visible"
})

console.log("AAA")
loginButton2.addEventListener('click', (e) => {
    console.log("CLIECKED")
    e.preventDefault()
    var googleUserId = getCookie("google_user_id");
    console.log(googleUserId)
    if(googleUserId){
        var redirection_url = "https://www.tiendanube.com/apps/5434/authorize?state="+ googleUserId
        console.log(redirection_url)
        window.location.href = redirection_url
    } else {
    googleSignIn.style.visibility = "visible"

    }
})

 // Function to switch language and add active class
 function switchLanguage(lang) {
    // Remove 'active' class from all language links
    var languageLinks = document.querySelectorAll('.dropdown-item');
    languageLinks.forEach(function(link) {
      link.classList.remove('active');
    });

    // Add 'active' class to the clicked language link
    var clickedLink = document.querySelector('.dropdown-item.' + lang);
    clickedLink.classList.add('active');
    // Update main button text
    var mainButton = document.getElementById('mainButton');
    // Create a new span element
    var spanIcon = document.createElement('span');
    // Add the necessary classes to the span element
    let flag = lang
    if(lang == 'pt'){
        flag = "br"
    }
    spanIcon.className = 'fi fi-' + flag;
    // Append the span element to the mainButton text content
    mainButton.textContent = lang.toUpperCase();
    mainButton.appendChild(spanIcon);

    //mainButton.textContent = lang.toUpperCase()
    

    // Check if sc_lang cookie already exists
    var existingLangCookie = getCookie("sc_lang");
        if (existingLangCookie) {
            // Update the value of the existing sc_lang cookie
            document.cookie = "sc_lang=" + lang + "; path=/;";
        } else {
            // Create a new sc_lang cookie
            document.cookie = "sc_lang=" + lang + "; path=/;";
        }
    window.location.reload();
  }

