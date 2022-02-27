var nombre = document.getElementById("nombre-usuario")
var mail = document.getElementById("email-usuario")
var foto = document.getElementById("foto-usuario")



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

}

