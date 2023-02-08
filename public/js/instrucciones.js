function copyToClipboard(e, btn) {
  e.preventDefault();     // prevent submit
  var str = document.getElementById("id-conexion");
  str.select();
  document.execCommand('copy');
  btn.innerHTML = "Copiado!";
  return false;           // prevent submit
}

//GOOGLE SIGN IN METHOD
var nombre = document.getElementById("nombre-usuario")
var mail = document.getElementById("email-usuario")
var foto = document.getElementById("foto-usuario")
var info_div = document.getElementById("info-usuario")
var logout_element = document.getElementById("logout-button")
var login_element = document.getElementById("login-button")


function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
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
