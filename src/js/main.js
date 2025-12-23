document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header-container");

  fetch("src/components/header.html")
    .then(res => res.text())
    .then(html => {
      header.innerHTML = html;
    });
});
