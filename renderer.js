function submitDate() {
  const date = document.getElementById("datePicker").value;
  if (!date) {
    alert("Select a date first!");
    return;
  }

  window.electronAPI.setDate(date);
}