/* admin.js - Logika Khusus Panel Admin */

// 1. RENDER DASHBOARD ADMIN (Ringkasan Stat)
function renderAdminDashboard() {
  const stats = {
    totalBooks: books.length,
    totalMembers: users.filter((u) => u.role === "member").length,
    activeLoans: loans.filter((l) => l.status === "pinjam").length,
    pendingVerif: users.filter(
      (u) => u.isVerified === false && u.role === "member",
    ).length,
  };

  document.getElementById("stat-total-books").textContent = stats.totalBooks;
  document.getElementById("stat-total-members").textContent =
    stats.totalMembers;
  document.getElementById("stat-active-loans").textContent = stats.activeLoans;
  document.getElementById("stat-pending-verif").textContent =
    stats.pendingVerif;

  // Render Aktivitas Terbaru (Logika sederhana mengambil 5 pinjaman terakhir)
  const activityList = document.getElementById("admin-activity-list");
  activityList.innerHTML =
    loans
      .slice(-5)
      .reverse()
      .map((l) => {
        const user = users.find((u) => u.id === l.userId);
        const book = books.find((b) => b.id === l.bookId);
        return `
      <div class="activity-item">
        <div class="activity-dot ${l.status === "pinjam" ? "blue" : "green"}"></div>
        <div class="activity-text">
          <strong>${user ? user.name : "User"}</strong> 
          ${l.status === "pinjam" ? "meminjam" : "mengembalikan"} 
          <strong>${book ? book.title : "Buku"}</strong>
        </div>
        <div class="activity-time">${l.date}</div>
      </div>
    `;
      })
      .join("") || '<p class="empty-state">Belum ada aktivitas.</p>';
}

// 2. MANAJEMEN BUKU (CRUD)
function renderAdminBooks() {
  const tbody = document.getElementById("admin-books-table");
  tbody.innerHTML = books
    .map(
      (b) => `
    <tr>
      <td>
        <div class="cell-user">
          <div class="admin-book-cover" style="background:${b.color}">${b.icon}</div>
          <div>
            <div class="cell-name">${b.title}</div>
            <div class="cell-sub">${b.author}</div>
          </div>
        </div>
      </td>
      <td><span class="tag ${b.type === "premium" ? "tag-red" : "tag-green"}">${b.type}</span></td>
      <td>${b.stock} Eks</td>
      <td>
        <div class="action-btns">
          <button class="btn-sm btn-sm-outline" onclick="editBook(${b.id})">Edit</button>
          <button class="btn-sm btn-sm-red" onclick="deleteBook(${b.id})">Hapus</button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

function handleAddBook(e) {
  e.preventDefault();
  const newBook = {
    id: Date.now(),
    title: document.getElementById("book-title").value,
    author: document.getElementById("book-author").value,
    type: document.getElementById("book-type").value,
    stock: parseInt(document.getElementById("book-stock").value),
    icon: "📖", // Default icon
    color: "#190bcd", // Default color
  };

  books.push(newBook);
  showToast("Buku berhasil ditambahkan!", "success");
  closeModal("modal-add-book");
  renderAdminBooks();
  renderAdminDashboard();
}

// 3. VERIFIKASI MEMBER
function renderAdminMembers() {
  const tbody = document.getElementById("admin-members-table");
  tbody.innerHTML = users
    .filter((u) => u.role === "member")
    .map(
      (u) => `
    <tr>
      <td>
        <div class="cell-user">
          <div class="table-avatar">${u.name[0]}</div>
          <div>
            <div class="cell-name">${u.name}</div>
            <div class="cell-sub">${u.email}</div>
          </div>
        </div>
      </td>
      <td><span class="tag ${u.isVerified ? "tag-green" : "tag-yellow"}">${u.isVerified ? "Verified" : "Pending"}</span></td>
      <td>
        ${!u.isVerified ? `<button class="btn-sm btn-sm-green" onclick="verifyMember(${u.id})">Verifikasi</button>` : "-"}
      </td>
    </tr>
  `,
    )
    .join("");
}

function verifyMember(userId) {
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.isVerified = true;
    showToast(`Akun ${user.name} berhasil diverifikasi!`, "success");
    renderAdminMembers();
    renderAdminDashboard();
  }
}

// 4. PENGATURAN ADMIN
function updateAdminPassword() {
  const oldPw = document.getElementById("set-oldpw").value;
  const newPw = document.getElementById("set-newpw").value;

  if (oldPw !== adminPw) {
    showToast("Password lama salah!", "error");
    return;
  }
  if (newPw.length < 6) {
    showToast("Password baru minimal 6 karakter!", "error");
    return;
  }

  adminPw = newPw;
  showToast("Password admin berhasil diubah 🔑", "success");
  document.getElementById("set-oldpw").value = "";
  document.getElementById("set-newpw").value = "";
}

// Tambahkan Event Listener untuk Form Admin
document.addEventListener("DOMContentLoaded", () => {
  const addBookForm = document.getElementById("form-add-book");
  if (addBookForm) {
    addBookForm.addEventListener("submit", handleAddBook);
  }
});
