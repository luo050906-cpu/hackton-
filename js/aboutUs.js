document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.getElementById("menu-icon");
  const menuItems = document.querySelector(".menu-items");

  if (menuIcon && menuItems) {
    menuIcon.addEventListener("click", () => {
      menuItems.classList.toggle("active");
      if (menuItems.classList.contains("active")) {
        menuIcon.classList.replace("bx-menu", "bx-x");
      } else {
        menuIcon.classList.replace("bx-x", "bx-menu");
      }
    });
  }
});
