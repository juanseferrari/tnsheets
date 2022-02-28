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


function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  nombre.innerText = profile.getName()
  mail.innerText = profile.getEmail()
  foto.src = profile.getImageUrl()
  console.log("ESTAMOS EN OnSignIn")
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

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
