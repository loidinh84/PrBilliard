const menuToggle = document.getElementById("menu-toggle");
const menuContainer = document.getElementById("menu-container");

menuToggle.addEventListener("click", function (event) {
  event.stopPropagation();
  menuContainer.classList.toggle("active");
});

window.addEventListener("click", function (event) {
  if (
    menuContainer.classList.contains("active") &&
    event.target !== menuToggle
  ) {
    menuContainer.classList.remove("active");
  }
});

const addBtn = document.getElementById("add-table-plus");
const modal = document.getElementById("add-table-modal");
const cancelBtn = document.getElementById("cancel-btn");

addBtn.addEventListener("click", function () {
  modal.classList.toggle("active");
});

cancelBtn.addEventListener("click", function () {
  modal.classList.remove("active");
});
