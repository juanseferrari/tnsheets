const goToWapp = document.querySelector("#goToWapp")
const text_contact = document.querySelector("#message")
const name_contact = document.querySelector("#name")
const email_contact = document.querySelector("#email")

goToWapp.addEventListener("click", function(e){
    e.preventDefault()
    var text_to_send = "Nombre: " + name_contact.value + "%0aEmail: "+ email_contact.value + "%0aMensaje: "+ text_contact.value
    window.open("https://wa.me/+5491140494130?text=" + text_to_send, '_blank').focus();
})

  //window.location.href="https://wa.me/+5491140494130?text=" + text;