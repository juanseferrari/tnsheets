
/** GENERIC FUNCTIONS */
function isUrlValid(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    console.log("url error: " + err)
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




function showError(errorMessage) {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = `<i class="fas fa-exclamation-circle error-icon"></i>${errorMessage}`;
}
function hideError() {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = ""
}



/** SHOPIFY LOGIN VALIDATIONS */
var sh_login_url = document.getElementById("shopify_url")
var sh_login_button = document.getElementById("shopify_button")



sh_login_button.addEventListener('click', (e) => {
  console.log("clicked on shopify")
  console.log(sh_login_url.value)
  var url_valid = isUrlValid(sh_login_url.value)
  console.log("isUrlValid: "+ url_valid)

  if(url_valid){
    console.log("VALID!")
    hideError() 
  } else {
    e.preventDefault()
    showError("Invalid url")
  }


})