function login() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  if (username && password) {
    fetch("http://localhost:2000/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Login Response:", data); // بررسی پاسخ سرور

        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role); // ذخیره نقش کاربر
          window.location.href = "admin.html"; // هدایت به صفحه ادمین
        } else {
          alert(data.message);
        }
      })
      .catch((error) => console.error("Login Error:", error));
  } else {
    alert("Please enter both username and password");
  }
}
function signup() {
  window.location.href = "signup.html";
}
