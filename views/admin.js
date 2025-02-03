function showTab(tab) {
  const allTabs = document.querySelectorAll(".tab-content");
  allTabs.forEach((tabContent) => tabContent.classList.remove("active-tab"));

  const selectedTab = document.getElementById(tab);
  selectedTab.classList.add("active-tab");
}

window.onload = function () {
  showTab("users");
  loadUsers();
  loadDesigns();
  loadPurchases();
};
function createUser() {
  window.location.href = "signup.html";
}

function editUser(userId) {
  alert(`Editing user with ID: ${userId}`);
  // Implement edit user functionality
}

function deleteUser(userId) {
  // تایید از کاربر قبل از حذف
  const isConfirmed = confirm("Are you sure you want to delete this user?");
  
  if (!isConfirmed) {
    return; // اگر کاربر تایید نکرد، عملیات حذف متوقف می‌شود
  }

  const token = localStorage.getItem("token"); // دریافت توکن از localStorage

  if (!token) {
    alert("Please log in first.");
    return;
  }

  // درخواست DELETE به سرور
  fetch(`http://localhost:2000/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.message || "Failed to delete user");
        });
      }
      return response.json();
    })
    .then((data) => {
      if (data.message === "User deleted") {
        alert("User deleted successfully!");
        // به‌روزرسانی صفحه یا لیست کاربران (اگر نیاز باشد)
        loadUsers();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    });
}


function loadUsers() {
  const token = localStorage.getItem("token"); // گرفتن توکن ذخیره‌شده
  fetch("http://localhost:2000/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((users) => {
      const usersTable = document.getElementById("users-table");

      usersTable.innerHTML = `
                      <tr>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Actions</th>
                      </tr>
                  `;

      users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                          <td>${user.username}</td>
                          <td>${user.email}</td>
                          <td>${user.role}</td>
                          <td>
                              ${
                                user.role !== "admin"
                                  ? `<button onclick="editUser('${user._id}')">Edit</button>
                                   <button onclick="deleteUser('${user._id}')">Delete</button>`
                                  : ""
                              }
                          </td>
                      `;
        usersTable.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to load users");
    });
}
function loadDesigns() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("No token found! Please login first.");
    return;
  }

  fetch("http://localhost:2000/designs", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        });
      }
      return response.json();
    })
    .then((designs) => {
      const designsTable = document.getElementById("designs-table");
      designsTable.innerHTML = `
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                `;
      designs.forEach((design) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                        <td>${design.title}</td>
                        <td>${design.category}</td>
                        <td>
                            <button onclick="editDesign('${design._id}')">Edit</button>
                            <button onclick="deleteDesign('${design._id}')">Delete</button>
                        </td>
                    `;
        designsTable.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to load designs: " + error.message);
    });
}
function loadPurchases() {
  fetch("http://localhost:2000/orders")
    .then((response) => response.json())
    .then((orders) => {
      const purchasesTable = document.getElementById("purchases-table");

      // پاک کردن داده‌های قبلی
      purchasesTable.innerHTML = `
                <tr>
                    <th>Username</th>
                    <th>Designs</th>
                    <th>Total Amount</th>
                    <th>Date</th>
                </tr>
            `;

      // اضافه کردن خریدها به جدول
      orders.forEach((order) => {
        const row = document.createElement("tr");

        // ساختن لیست طرح‌ها به صورت رشته
        const designs = order.designs
          .map((design) => design.designId.title)
          .join(", ");

        row.innerHTML = `
                    <td>${order.buyer.username}</td>
                    <td>${designs}</td>
                    <td>${order.totalAmount}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                `;
        purchasesTable.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to load purchases");
    });
}
