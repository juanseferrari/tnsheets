/** SHOPIFY LOGIN VALIDATIONS */
var sh_login_url = document.getElementById("shopify_url")
var sh_login_button = document.getElementById("shopify_button")


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




function showError(errorMessage) {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = `${errorMessage}`;
  sh_login_url.classList.add("is-invalid")

}
function hideError() {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = ""
  sh_login_url.classList.remove("is-invalid")
}






sh_login_button.addEventListener('click', (e) => {
  console.log("clicked on shopify")
  console.log(sh_login_url.value)
  var url_valid = isUrlValid(sh_login_url.value)
  //DO A HEAD REQUEST TO CHECK IF THE POWERED BY IS FROM SHOPIFY
  console.log("isUrlValid: "+ url_valid)

  if(url_valid){
    console.log("VALID!")
    hideError() 
    let final_url = sh_login_url.value
    console.log("final_url: "+ final_url)
    //https://quickstart-1893efc4.myshopify.com/admin/oauth/authorize?client_id=75abca07b3318a56f4073ec4ccb16e90&scope=read_products,write_products,read_customers,read_orders,read_inventory,write_inventory&redirect_uri=http://localhost:5001/shopify/oauth
    var redirection_url = final_url + "/admin/oauth/authorize?client_id=75abca07b3318a56f4073ec4ccb16e90&scope=read_products,write_products,read_customers,read_orders,read_inventory,write_inventory&redirect_uri=https://www.sheetscentral.com/shopify/oauth"  
    console.log(redirection_url)
    window.location.href = redirection_url
  } else {
    e.preventDefault()
    showError("Invalid url")
  }


})

/**  
   // Add event listener for input changes
   sh_login_url.addEventListener('click', function () {
    var inputValue = sh_login_url.value;
    console.log(inputValue)
    if (inputValue === '') {
      // If empty, add the default value
      sh_login_url.value = 'https://www.';
    }
  });
  */