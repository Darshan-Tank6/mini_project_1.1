function updateHiddenInput(radio) {
  document.getElementById("role").value = radio.value;
  if (radio.value != "advisor") {
    document.getElementById("regNo").style.display = "none";
    document.getElementById("contactPerson").style.display = "none";
    document.getElementById("location").style.display = "none";
  }
}
