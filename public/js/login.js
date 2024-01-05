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
     let url =  new URL(string);
     console.log("url: " + url )

    // Validate the scheme
      if (!['http:', 'https:'].includes(url.protocol.toLowerCase())) {
        return false;
      }
          // Extract the domain (remove 'www.' if present)
    let domain = url.hostname.toLowerCase().replace(/^www\./, '');
    console.log(domain)
    // Check if the domain has a dot (.)
    if (!domain.includes('.')) {
      return false;
    }
   
    return true;
  } catch (err) {
    console.log("err: " + err)
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
 
    console.log('User signed out.');
  });
}


function showError(errorMessage) {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = `<i class="fas fa-exclamation-circle error-icon"></i>${errorMessage}`;
}
function hideError() {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = ""
}

/** WOOCOMMERCE LOGIN VALIDATIONS */
var wo_login_url = document.getElementById("woocommerce_url")
var wo_login_button = document.getElementById("woocommerce_button")



wo_login_button.addEventListener('click', () => {
  console.log("clicked on woocommerce")
  console.log(wo_login_url.value)
  var url_valid = isUrlValid(wo_login_url.value)
  console.log("isUrlValid: "+ url_valid)

  if(url_valid){
    console.log("VALID!")
    hideError()
    var final_url = extractBaseUrl(wo_login_url.value)
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
  
   // Add event listener for input changes
   /**  
   wo_login_url.addEventListener('click', function () {
    var inputValue = wo_login_url.value;
    console.log(inputValue)
    if (inputValue === '') {
      // If empty, add the default value
      wo_login_url.value = 'https://www.';
    }
  });

var url = "https://woo-generously-furry-wombat.wpcomstaging.com/"
*/


