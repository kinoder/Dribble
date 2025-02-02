function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    if (username && password) {
      fetch("http://localhost:2000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Login successful") {
            if (data.role == "admin") {
              window.location.href = "admin.html";
            } else if (data.role == "designer") {
              window.location.href = "designer.html";
            } else {
              window.location.href = "buyer.html";
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
      alert("Please enter both username and password");
    }
  }
  function signup() {
    window.location.href = "signup.html";
  }