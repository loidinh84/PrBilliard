document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const usernameInput = document.getElementById("username").value;
  const passwordInput = document.getElementById("password").value;
  const btn = document.querySelector(".btn");
  const originalText = btn.innerText;
  btn.innerText = "ĐANG KIỂM TRA...";
  btn.style.opacity = "0.7";

  fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: usernameInput,
      password: passwordInput,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        // A. Lưu thông tin người dùng vào bộ nhớ trình duyệt
        localStorage.setItem("user_id", data.user.id);
        localStorage.setItem("user_role", data.user.role);
        localStorage.setItem("user_name", data.user.full_name);

        // B. Thông báo & Chuyển trang
        btn.style.background = "#4CAF50";
        btn.innerText = "ĐĂNG NHẬP THÀNH CÔNG!";

        setTimeout(() => {
          window.location.href = "home.html";
        }, 1000);
      } else {
        alert(data.message);

        btn.innerText = originalText;
        btn.style.opacity = "1";
        btn.style.background = "#fff";
      }
    })
    .catch((err) => {
      console.error("Lỗi:", err);
      alert("Không thể kết nối đến Server! Hãy kiểm tra lại.");
      btn.innerText = originalText;
      btn.style.opacity = "1";
    });
});
