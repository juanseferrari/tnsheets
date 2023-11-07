var nombre = document.getElementById("nombre-usuario")
var mail = document.getElementById("email-usuario")
var foto = document.getElementById("foto-usuario")
var info_div = document.getElementById("info-usuario")
var logout_element = document.getElementById("logout-button")
var login_element = document.getElementById("login-button")

if(checkIfLoggedIn()){
  info_div.style.display = "block"
  login_element.style.display = "none"
}

/** GENERIC FUNCTIONS */
function isUrlValid(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
 }

 function extractBaseUrl(url) {
  // Convert the input to a string
  let urlString = String(url);

  // Remove query parameters
  let baseUrl = urlString.split('?')[0];

  // Remove trailing slash, if any
  if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
  }

  return baseUrl;
}



function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  nombre.innerText = profile.getName()
  mail.innerText = profile.getEmail()
  foto.src = profile.getImageUrl()

  var myUserEntity = {};
  myUserEntity.Id = profile.getId();
  myUserEntity.Name = profile.getName();
  
  //Store the entity object in sessionStorage where it will be accessible from all pages of your site.
  sessionStorage.setItem('myUserEntity',JSON.stringify(myUserEntity));

  info_div.style.display = "block"
  logout_element.style.display = "block"
  login_element.style.display = "none"
}

function checkIfLoggedIn(){
  if(sessionStorage.getItem('myUserEntity') == null){
    //Redirect to login page, no user entity available in sessionStorage
    console.log(" NO LOGUEADO")
    return false
    
  } else {
    //User already logged in
    var userEntity = {};
    userEntity = JSON.parse(sessionStorage.getItem('myUserEntity'));
    console.log("LOGUEADO")
    return true
  }
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    sessionStorage.clear();
    info_div.style.display = "none"
    logout_element.style.display = "none"
    login_element.style.display = "block"

    console.log('User signed out.');
  });
}


function showError(errorMessage) {
  const errorContainer = document.getElementById('errorContainer');
  errorContainer.innerHTML = `<i class="fas fa-exclamation-circle error-icon"></i>${errorMessage}`;
}
function hideError() {
  const errorContainer = document.getElementById('errorContainer');
  errorContainer.innerHTML = ""
}
/** WOOCOMMERCE LOGIN VALIDATIONS */
var login_url = document.getElementById("woocommerce_url")
var login_button = document.getElementById("woocommerce_button")



login_button.addEventListener('click', () => {
  console.log("clicked on woocommerce")
  console.log(login_url.value)
  var url_valid = isUrlValid(login_url.value)
  console.log("isUrlValid: "+ url_valid)

  if(url_valid){
    console.log("VALID!")
    hideError()
    var final_url = extractBaseUrl(login_url.value)
    console.log("final_url: "+ final_url)
    // similar behavior as clicking on a link
    //window.location.href = "http://stackoverflow.com";
    var redirection_url = final_url + "/wc-auth/v1/authorize?app_name=Sheets Central&scope=read_write&user_id=1234&return_url=https://www.sheetscentral.com/woocommerce/oauth&callback_url=https://www.sheetscentral.com/woocommerce/oauth"  
    console.log(redirection_url)
    window.location.href = redirection_url
  } else {
    showError("Invalid url")
  }


})
var url = "https://woo-generously-furry-wombat.wpcomstaging.com/"



