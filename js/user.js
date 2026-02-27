/* user.js - Logika Khusus Member & Katalog */

// 1. RENDER KATALOG BUKU
function renderKatalog() {
  const container = document.getElementById("books-grid");
  const searchInput = document.getElementById("search-input");
  const filterType = document.getElementById("filter-type");

  const query = searchInput ? searchInput.value.toLowerCase() : "";
  const type = filterType ? filterType.value : "all";

  // Filter buku berdasarkan pencarian dan tipe
  const filteredBooks = books.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query);
    const matchType = type === "all" || b.type === type;
    return matchSearch && matchType;
  });

  if (filteredBooks.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">Buku tidak ditemukan.</div>`;
    return;
  }

  container.innerHTML = filteredBooks
    .map(
      (b) => `
    <div class="book-card">
      <div class="book-cover" style="background:${b.color}">${b.icon}</div>
      <div class="book-info">
        <span class="tag ${b.type === "premium" ? "tag-red" : "tag-green"}">${b.type}</span>
        <h3 class="book-title">${b.title}</h3>
        <p class="book-author">${b.author}</p>
        <div class="book-footer">
          <span class="stock ${b.stock === 0 ? "empty" : ""}">${b.stock > 0 ? b.stock + " Eks" : "Habis"}</span>
          <button class="btn-sm btn-sm-primary" onclick="pinjamBuku(${b.id})" ${b.stock === 0 ? "disabled" : ""}>
            ${b.stock > 0 ? "Pinjam" : "Kosong"}
          </button>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

// 2. LOGIKA PEMINJAMAN
function pinjamBuku(bookId) {
  if (!currentUser) {
    showToast("Silakan login terlebih dahulu!", "warning");
    showModal("modal-login");
    return;
  }

  if (!currentUser.isVerified) {
    showToast("Akun Anda belum diverifikasi admin!", "error");
    return;
  }

  const book = books.find((b) => b.id === bookId);

  if (book && book.stock > 0) {
    // Kurangi stok
    book.stock--;

    // Tambahkan ke data peminjaman
    const newLoan = {
      id: Date.now(),
      userId: currentUser.id,
      bookId: book.id,
      date: new Date().toISOString().split("T")[0],
      status: "pinjam",
    };
    loans.push(newLoan);

    showToast(`Berhasil meminjam buku: ${book.title}`, "success");
    renderKatalog(); // Update tampilan katalog
  }
}

// 3. RENDER DASHBOARD USER
function renderUserDashboard() {
  if (!currentUser) return;

  // Header Dashboard
  document.getElementById("user-welcome-name").textContent = currentUser.name;
  document.getElementById("user-status-tag").className =
    `tag ${currentUser.isVerified ? "tag-green" : "tag-yellow"}`;
  document.getElementById("user-status-tag").textContent =
    currentUser.isVerified ? "Verified" : "Pending Verification";

  // Render Buku yang Sedang Dipinjam
  const userLoans = loans.filter((l) => l.userId === currentUser.id);
  const loanContainer = document.getElementById("user-loans-list");

  if (userLoans.length === 0) {
    loanContainer.innerHTML = `<p style="color: #666;">Anda belum meminjam buku apapun.</p>`;
  } else {
    loanContainer.innerHTML = userLoans
      .map((l) => {
        const book = books.find((b) => b.id === l.bookId);
        return `
        <div class="loan-item">
          <div class="loan-info">
            <strong>${book ? book.title : "Buku Tidak Diketahui"}</strong>
            <div style="font-size: 0.75rem; color: #666;">Dipinjam pada: ${l.date}</div>
          </div>
          <button class="btn-sm btn-sm-outline" onclick="kembalikanBuku(${l.id})">Kembalikan</button>
        </div>
      `;
      })
      .join("");
  }
}

// 4. LOGIKA PENGEMBALIAN
function kembalikanBuku(loanId) {
  const loanIndex = loans.findIndex((l) => l.id === loanId);
  if (loanIndex > -1) {
    const loan = loans[loanIndex];
    const book = books.find((b) => b.id === loan.bookId);

    if (book) book.stock++; // Kembalikan stok

    loans.splice(loanIndex, 1); // Hapus dari daftar pinjam
    showToast("Buku berhasil dikembalikan.", "success");
    renderUserDashboard();
  }
}

// Event Listeners untuk pencarian di katalog
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const filterType = document.getElementById("filter-type");

  if (searchInput) {
    searchInput.addEventListener("input", renderKatalog);
  }
  if (filterType) {
    filterType.addEventListener("change", renderKatalog);
  }
});
