const role = localStorage.getItem("user_role");
if (role !== "admin") {
  alert("Bạn không có quyền truy cập khu vực này!");
  window.location.href = "home.html";
}

// 2. Hiện tên Admin
const adminName = localStorage.getItem("user_name");
if (adminName) document.getElementById("admin-name").innerText = adminName;

// 3. Hàm Đăng xuất
function logoutAdmin() {
  if (confirm("Đăng xuất khỏi hệ thống quản trị?")) {
    localStorage.clear();
    window.location.href = "login.html";
  }
}

// 4. Hiệu ứng Sidebar (Optional)
let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".sidebarBtn");
sidebarBtn.onclick = function () {
  sidebar.classList.toggle("active");
  if (sidebar.classList.contains("active")) {
    sidebarBtn.classList.replace("bx-menu", "bx-menu-alt-right");
  } else sidebarBtn.classList.replace("bx-menu-alt-right", "bx-menu");
};
