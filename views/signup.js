function signup() {
  let email = document.getElementById("email").value;
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let role = document.getElementById("role").value;

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }
  if (email && username && password) {
    fetch("http://localhost:2000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password, role }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "User created") {
          alert("User created successfully!");
          if (role === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "login.html";
          }
        } else {
          alert(data.message || "Something went wrong");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
      });
  } else {
    alert("Please fill in all the fields");
  }
}
