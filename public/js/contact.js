const goToWapp = document.querySelector("#goToWapp")
const text = document.querySelector("#message")

goToWapp.addEventListener("click", function(e){
    e.preventDefault()
    console.log(text.value)
    window.open("https://wa.me/+5491140494130?text=" + text.value, '_blank').focus();
})

  //window.location.href="https://wa.me/+5491140494130?text=" + text;