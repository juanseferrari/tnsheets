const goToWapp = document.querySelector("#goToWapp")
const text_contact = document.querySelector("#message")
const name_contact = document.querySelector("#name")
const email_contact = document.querySelector("#email")
const contact_user_id = document.querySelector("#user_id")

goToWapp.addEventListener("click", function(e){
    e.preventDefault()
    console.log("CLICKED")
    let text_to_send = ""
    if(contact_user_id){
      text_to_send = "Nombre: " + name_contact.value + "%0aEmail: "+ email_contact.value +  "%0aUser: "+ contact_user_id.value +  "%0aMensaje: "+ text_contact.value
    } else {
      text_to_send = "Nombre: " + name_contact.value + "%0aEmail: "+ email_contact.value + "%0aMensaje: "+ text_contact.value
    }
    window.open("https://wa.me/+541172000689?text=" + text_to_send, '_blank').focus();
})
