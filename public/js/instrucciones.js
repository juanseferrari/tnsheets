function copyToClipboard(e, btn) {
  e.preventDefault();     // prevent submit
  var str = document.getElementById("id-conexion");
  str.select();
  document.execCommand('copy');
  btn.innerHTML = "Copiado!";
  return false;           // prevent submit
}