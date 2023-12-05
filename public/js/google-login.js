
const button = document.getElementById('signout_button');


button.onclick = () => {
  console.log("Click")

  google.accounts.id.disableAutoSelect();
    // Remove the cookie by setting its value to an empty string and providing an expiration date in the past
    document.cookie = "google_user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirect to the home page
    window.location.href = "/";

}