/* app.js - Logika Utama & Manajemen Data */

// 1. DATA STATE (Source of Truth)
let currentUser = null;
let adminPw = "admin123";

let books = [
  {
    id: 1,
    title: "Sitti Nurbaya",
    author: "Marah Roesli",
    type: "classic",
    stock: 3,
    icon: "📖",
    color: "#190bcd",
  },
  {
    id: 2,
    title: "Layar Terkembang",
    author: "Sutan Takdir A.",
    type: "premium",
    stock: 0,
    icon: "✨",
    color: "#d94015",
  },
  {
    id: 3,
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    type: "premium",
    stock: 5,
    icon: "🌍",
    color: "#e9fb52",
  },
];

let users = [
  {
    id: 1715000000001,
    name: "Budi Santoso",
    email: "budi@mail.com",
    pw: "user123",
    role: "member",
    isVerified: true,
  },
  {
    id: 2,
    name: "Administrator",
    email: "admin@perpus.com",
    pw: "admin123",
    role: "admin",
    isVerified: true,
  },
];

let loans = [
  {
    id: 101,
    userId: 1715000000001,
    bookId: 1,
    date: "2024-05-20",
    status: "pinjam",
  },
];

// 2. NAVIGASI HALAMAN
function showPage(id) {
  // Sembunyikan semua halaman
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));

  // Tampilkan halaman yang dituju
  const targetPage = document.getElementById(id);
  if (targetPage) {
    targetPage.classList.add("active");
    window.scrollTo(0, 0);
  }

  // Logika khusus saat masuk ke halaman tertentu
  if (id === "katalog") renderKatalog();
  if (id === "dashboard") renderUserDashboard();
  if (id === "admin-page") {
    renderAdminDashboard();
    renderAdminBooks();
    renderAdminMembers();
  }
}

// 3. SISTEM AUTENTIKASI (Login & Register)
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const pw = document.getElementById("login-pw").value;

  const user = users.find((u) => u.email === email && u.pw === pw);

  if (!user) {
    showAlert("login-alert", "Email atau password salah!");
    return;
  }

  currentUser = user;
  showToast(`Selamat datang, ${user.name}!`, "success");
  closeModal("modal-login");

  // Arahkan berdasarkan role
  if (user.role === "admin") {
    showPage("admin-page");
  } else {
    showPage("dashboard");
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const pw = document.getElementById("reg-pw").value;

  if (users.find((u) => u.email === email)) {
    showAlert("reg-alert", "Email sudah terdaftar!");
    return;
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    pw,
    role: "member",
    isVerified: false,
  };

  users.push(newUser);
  showToast("Registrasi berhasil! Silakan login.", "success");
  switchModal("modal-reg", "modal-login");
}

function logout() {
  currentUser = null;
  showPage("landing");
  showToast("Berhasil keluar.");
}

// 4. UI HELPERS (Modal & Toast)
function showModal(id) {
  document.getElementById(id).classList.add("show");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

function switchModal(from, to) {
  closeModal(from);
  showModal(to);
}

function showAlert(id, msg, type = "error") {
  const alertEl = document.getElementById(id);
  alertEl.innerHTML = `<div class="alert alert-${type}">${type === "error" ? "⚠️" : "✅"} ${msg}</div>`;
}

function showToast(msg, type = "") {
  const container = document.getElementById("toastContainer");
  const t = document.createElement("div");
  t.className = `toast ${type}`;

  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;

  container.appendChild(t);

  setTimeout(() => {
    t.style.animation = "slideOut .3s ease forwards";
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// 5. INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  // Event listener untuk klik di luar modal (overlay)
  document.querySelectorAll(".overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("show");
    });
  });

  // Tampilkan halaman landing pertama kali
  showPage("landing");
});
