document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.getElementById("menu-icon");
  const menuItems = document.getElementById("menu-items");
  const startBtn = document.getElementById("start-btn");

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      window.location.href = "/feed.html";
    });
  }

  menuIcon.addEventListener("click", () => {
    menuItems.classList.toggle("active");
    if (menuItems.classList.contains("active")) {
      menuIcon.classList.replace("bx-menu", "bx-x");
    } else {
      menuIcon.classList.replace("bx-x", "bx-menu");
    }
  });
});
