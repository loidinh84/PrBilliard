// const { table } = require("console");

// const { ppid } = require("process");

const tablesStartTimes = {};

// ==================== DOM Elements ====================
const elements = {
  menuToggle: document.getElementById("menu-toggle"),
  menuContainer: document.getElementById("menu-container"),
  addBtn: document.getElementById("add-table-plus"),
  modal: document.getElementById("add-table-modal"),
  cancelBtn: document.getElementById("cancel-btn"),
  addTableForm: document.getElementById("add-table-form"),
  tableName: document.getElementById("table-name"),
  tableType: document.getElementById("table-type"),
  tableList: document.querySelector(".table__list"),
  playingCount: document.getElementById("section__playing"),
  tablesCount: document.getElementById("section__tables"),
  deleteModal: document.getElementById("delete-confirm"),
  deleteCancel: document.getElementById("btn__cancel__delete"),
  deleteSubmit: document.getElementById("btn__confirm__delete"),
  deleteTableName: document.getElementById("delete__table"),
  modalTitle: document.getElementById("modal-title"),
  modalUpdate: document.getElementById("modal-update"),
  // Menu
  manageMenuBtn: document.getElementById("manage-menu-btn"),
  manageMenuModal: document.getElementById("manage-menu-modal"),
  closeMenuBtn: document.getElementById("close-menu-modal"),
  openMenuBtn: document.getElementById("open-add-menu"),
  addMenuForm: document.getElementById("add-menu"),
  cancelAddMenu: document.getElementById("cancel-add-menu"),
  menuNameInput: document.getElementById("menu-name"),
  menuPriceInput: document.getElementById("menu-price"),
  menuCategoryInput: document.getElementById("menu-category"),
  menuItemList: document.getElementById("menu-item-list"),
  searchInput: document.getElementById("search-menu"),
  // Detail bill
  tableDetails: document.getElementById("table-detail"),
  closeDetailBtn: document.getElementById("close-detail"),
  detailsTableTitle: document.getElementById("detail-title"),
  detailsMenu: document.getElementById("details-menu-container"),
  detailsOrder: document.getElementById("details-order-container"),
  summaryTime: document.getElementById("summary-time"),
  summaryStartTime: document.getElementById("summary-start-time"),
  summaryItems: document.getElementById("summary-items"),
  summaryPrice: document.getElementById("summary-price"),
  discountBtn: document.getElementById("discount-btn"),
  moveTableBtn: document.getElementById("move-table-btn"),
  checkoutBtn: document.getElementById("checkout-btn"),
  startStopBtn: document.getElementById("start-stop-btn"),
  menuCategoryFilter: document.getElementById("menu-category-filter"),
  searchMenuDetail: document.getElementById("search-menu-detail"),
  // History
  historyBtn: document.getElementById("history-btn"),
  historyModal: document.getElementById("history-modal"),
  closeHistoryModal: document.getElementById("close-history-modal"),
  closeHistoryBtn: document.getElementById("close-history-btn"),
  historyList: document.getElementById("history-list"),
  // Sidebar
  sidebar: document.getElementById("right-sidebar"),
  overlay: document.getElementById("sidebar-overlay"),
  openBtn: document.getElementById("open-sidebar"),
  closeBtn: document.getElementById("close-sidebar"),
  // Các nút trong sidebar
  sidebarAddTable: document.getElementById("sidebar-add-table"),
  sidebarManageMenu: document.getElementById("manage-menu-btn"),
  sidebarHistory: document.getElementById("history-btn"),
};

let currentPlaying = 0;
let currentTables = 0;
let tableDelete = null;
let tableUpdate = null;
let editItem = null;
let currentTableID = null;
let tableMeals = {};
let tableStartTimes = {};
let selectedCategory = "all";
let itemDeleteID = null;
let tableProgress = {};
let tableDiscount = {};
let dailyRevenue = 0;
let confirmCallback = null;
let promptCallback = null;
let invoiceHistory = [];

// Menu mẫu
let menuData = [
  { id: 1, name: "Cà phê đá", price: 25000, category: "drink" },
  { id: 2, name: "Mì xào bò", price: 45000, category: "food" },
  { id: 3, name: "Thuốc lá 555", price: 30000, category: "tobacco" },
  { id: 4, name: "Bàn Lỗ - 1 giờ", price: 50000, category: "table" },
  { id: 5, name: "Bàn Phăng - 1 giờ", price: 60000, category: "table" },
];

// ===========================Sidebar controller=============================
function openSidebar() {
  if (elements.sidebar) elements.sidebar.classList.add("active");
  if (elements.overlay) elements.overlay.classList.add("active");
}

function closeSidebar() {
  if (elements.sidebar) elements.sidebar.classList.remove("active");
  if (elements.overlay) elements.overlay.classList.remove("active");
}

if (elements.openBtn) {
  elements.openBtn.addEventListener("click", openSidebar);
}

if (elements.closeBtn) {
  elements.closeBtn.addEventListener("click", closeSidebar);
}

if (elements.overlay) {
  elements.overlay.addEventListener("click", closeSidebar);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSidebar();
    const activeModals = document.querySelectorAll(".table-modal.active");
    activeModals.forEach((modal) => modal.classList.remove("active"));
    tableDelete = null;
    itemDeleteID = null;
    currentTableID = null;
  }
});

// =========================== Sidebar Menu Handlers ===========================

// 1. Thêm bàn mới
if (elements.sidebarAddTable) {
  elements.sidebarAddTable.addEventListener("click", () => {
    closeSidebar();
    tableUpdate = null;
    elements.modalTitle.textContent = "Thêm bàn mới";
    elements.modalUpdate.textContent = "Thêm";
    elements.tableName.value = "";
    elements.tableType.value = "";
    elements.modal.classList.add("active");
  });
}

// 2. Quản lý menu
// Lưu ý: Dùng manageMenuBtn chung cho cả Sidebar và Header (nếu có)
if (elements.manageMenuBtn) {
  elements.manageMenuBtn.addEventListener("click", () => {
    closeSidebar();
    renderMenu();
    elements.manageMenuModal.classList.add("active");
  });
}

// 3. Lịch sử
if (elements.historyBtn) {
  elements.historyBtn.addEventListener("click", () => {
    closeSidebar();
    renderHistory();
    elements.historyModal.classList.add("active");
  });
}

// ============================History Manager===================================
if (elements.closeHistoryModal) {
  elements.closeHistoryModal.addEventListener("click", () => {
    elements.historyModal.classList.remove("active");
  });
}
if (elements.closeHistoryBtn) {
  elements.closeHistoryBtn.addEventListener("click", () => {
    elements.historyModal.classList.remove("active");
  });
}

function renderHistory() {
  const list = document.getElementById("history-list");
  if (!list) return;
  list.innerHTML = "";

  if (invoiceHistory.length === 0) {
    list.innerHTML = `<tr><td colspan="6" class="history-empty">Chưa có giao dịch nào</td></tr>`;
    return;
  }

  invoiceHistory.forEach((inv) => {
    const row = document.createElement("tr");
    row.style.cursor = "pointer";

    const invoiceCode = `HD${inv.id.toString().slice(-6)}`;
    const finalMoney = new Intl.NumberFormat("vi-VN").format(inv.final);

    row.innerHTML = `
        <td><span class="code-text">${invoiceCode}</span></td>
        <td style="color: #555;">${inv.time}</td>
        <td style="font-weight: 500;">${inv.tableName}</td>
        <td>Khách lẻ</td> <td class="text-right money-text">${finalMoney}</td>
        <td class="text-right">${finalMoney}</td> <td class="text-center">
            <span class="status-badge status-success">Hoàn thành</span>
        </td>
    `;
    row.addEventListener("click", () => showInvoiceDetail(inv));
    list.appendChild(row);
  });
}

function showInvoiceDetail(invoice) {
  document.getElementById("inv-detail-id").textContent = getInvoiceCode(
    invoice.id
  );
  document.getElementById("inv-detail-table").textContent = invoice.tableName;
  document.getElementById("inv-detail-time").textContent = invoice.time;
  document.getElementById("inv-detail-staff").textContent =
    invoice.staff || "Admin";

  const listContainer = document.getElementById("inv-detail-list");
  listContainer.innerHTML = "";

  invoice.items.forEach((item) => {
    let name = item.name;
    let price = item.price * item.quantity;
    let quantityDisplay = item.quantity;

    // Nếu là bàn thì hiển thị khác 1 chút
    if (item.category === "table") {
      price = item.totalPrice;
      quantityDisplay = "Giờ";
    }

    listContainer.innerHTML += `
        <tr class="inv-row">
            <td class="col-inv-name">${name}</td>
            <td class="col-inv-qty">${quantityDisplay}</td>
            <td class="col-inv-price">${new Intl.NumberFormat("vi-VN").format(
              price
            )}đ</td>
        </tr>
      `;
  });

  // Render tổng tiền
  document.getElementById("inv-detail-total").textContent =
    new Intl.NumberFormat("vi-VN").format(invoice.total) + "đ";
  document.getElementById("inv-detail-discount").textContent =
    "-" + new Intl.NumberFormat("vi-VN").format(invoice.discount) + "đ";
  document.getElementById("inv-detail-final").textContent =
    new Intl.NumberFormat("vi-VN").format(invoice.final) + "đ";

  // Mở modal
  document.getElementById("invoice-detail-modal").classList.add("active");
}

// Đóng modal chi tiết
document.getElementById("close-inv-detail").addEventListener("click", () => {
  document.getElementById("invoice-detail-modal").classList.remove("active");
});

// ============================Custom Dialogs=======================================
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.classList.add("toast", type);

  let icon = "./assets/icon/tick.svg";
  if (type === "error") icon = "./assets/icon/err.svg";
  if (type === "warning") icon = "./assets/icon/warning.svg";

  toast.innerHTML = `
  <img src="${icon}" class="toast-icon" alt="icon" />
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function showAlert(message) {
  document.getElementById("alert-message").textContent = message;
  document.getElementById("custom-alert-modal").classList.add("active");
}
document.getElementById("btn-alert-ok").addEventListener("click", () => {
  document.getElementById("custom-alert-modal").classList.remove("active");
});

function showConfirm(message, onYes) {
  document.getElementById("confirm-message").innerHTML = message.replace(
    /\n/g,
    "<br>"
  );
  confirmCallback = onYes;
  document.getElementById("custom-confirm-modal").classList.add("active");
}
document.getElementById("btn-confirm-yes").addEventListener("click", () => {
  if (confirmCallback) confirmCallback();
  document.getElementById("custom-confirm-modal").classList.remove("active");
});
document.getElementById("btn-confirm-no").addEventListener("click", () => {
  document.getElementById("custom-confirm-modal").classList.remove("active");
});

function showPrompt(title, placeholder, onOk, inputType = "text") {
  const modal = document.getElementById("custom-prompt-modal");
  const input = document.getElementById("prompt-input");
  document.getElementById("prompt-title").textContent = title;
  input.placeholder = placeholder;
  input.value = "";
  input.type = inputType;
  document.getElementById("prompt-error").style.display = "none";

  promptCallback = onOk;
  modal.classList.add("active");
  setTimeout(() => input.focus(), 100);
}
document.getElementById("btn-prompt-ok").addEventListener("click", () => {
  const value = document.getElementById("prompt-input").value.trim();
  if (!value) {
    document.getElementById("prompt-error").style.display = "block";
    return;
  }
  if (promptCallback) promptCallback(value);
  document.getElementById("custom-prompt-modal").classList.remove("active");
});
document.getElementById("btn-prompt-cancel").addEventListener("click", () => {
  document.getElementById("custom-prompt-modal").classList.remove("active");
});

document.getElementById("btn-prompt-ok").addEventListener("click", () => {
  const value = document.getElementById("prompt-input").value.trim();
  if (!value) {
    document.getElementById("prompt-error").style.display = "block";
    return;
  }
  if (promptCallback) promptCallback(value);
  document.getElementById("custom-prompt-modal").classList.remove("active");
});

document.getElementById("btn-prompt-cancel").addEventListener("click", () => {
  document.getElementById("custom-prompt-modal").classList.remove("active");
});

document.getElementById("prompt-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("btn-prompt-ok").click();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const activeModals = document.querySelectorAll(".table-modal.active");

    activeModals.forEach((modal) => {
      modal.classList.remove("active");
    });

    tableDelete = null;
    itemDeleteID = null;
    currentTableID = null;
  }
});

// ============================Event 3 button in detail table========================
// Giảm giá
elements.discountBtn.addEventListener("click", () => {
  if (!currentTableID) return;

  showPrompt(
    "Nhập % giảm giá",
    "ví dụ: 10",
    (value) => {
      let discountValue = parseInt(value);
      if (isNaN(discountValue) || discountValue < 0) discountValue = 0;
      if (discountValue > 100) discountValue = 100;

      tableDiscount[currentTableID] = discountValue;

      if (discountValue > 0) {
        elements.discountBtn.textContent = ` Giảm ${discountValue}%`;
        elements.discountBtn.style.background = "#e53e3e";
        showToast(` Đã áp dụng giảm giá ${discountValue}%`, "success");
      } else {
        elements.discountBtn.textContent = "Giảm giá";
        elements.discountBtn.style.background = "";
      }
      renderOrderItems();
    },
    "number"
  );
});

// Thanh Toán
elements.checkoutBtn.addEventListener("click", () => {
  if (!currentTableID) return;

  // 1. Lấy thông tin bàn hiện tại
  const tableElement = document
    .querySelector(`.table__header[data-id="${currentTableID}"]`)
    .closest(".table");

  const isPlaying = tableElement.classList.contains("table__playing");
  const hasItems =
    tableMeals[currentTableID] && tableMeals[currentTableID].length > 0;

  if (!isPlaying && !hasItems) {
    alert("Bàn này đang trống, không thể thanh toán!");
    return;
  }

  // 2. Tính toán tổng tiền (Giữ nguyên logic cũ của bạn)
  let tempTotal = 0;
  if (tableMeals[currentTableID]) {
    tableMeals[currentTableID].forEach((order) => {
      const itemTotal =
        order.category === "table"
          ? order.totalPrice || 0
          : order.price * order.quantity;
      tempTotal += itemTotal;
    });
  }

  const discount = tableDiscount[currentTableID] || 0;
  const discountAmount = Math.ceil((tempTotal * discount) / 100);
  const finalBill = tempTotal - discountAmount;
  const tableName = tableElement.querySelector(".table__title").textContent;

  // 3. Hiển thị hộp thoại xác nhận
  showConfirm(
    `Xác nhận thanh toán ${tableName}?\nTổng tiền: ${new Intl.NumberFormat(
      "vi-VN"
    ).format(finalBill)}đ`,
    () => {
      // --- BẮT ĐẦU ĐOẠN THAY ĐỔI (GỌI SERVER) ---

      // Bước A: Chuẩn bị dữ liệu gửi lên Server
      const invoiceData = {
        table_name: tableName,
        total_amount: tempTotal,
        discount_amount: discountAmount,
        final_amount: finalBill,
        items: tableMeals[currentTableID] || [], // Danh sách món
      };

      // Bước B: Gọi API lưu hóa đơn
      fetch("http://localhost:3000/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      })
        .then((res) => res.json())
        .then((data) => {
          // Bước C: Gọi API Reset bàn về trạng thái 'Trống'
          return fetch(`http://localhost:3000/api/tables/${currentTableID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Trống" }),
          });
        })
        .then(() => {
          // Bước D: Dọn dẹp dữ liệu tạm ở Frontend
          delete tableMeals[currentTableID];
          delete tableStartTimes[currentTableID];
          delete tableProgress[currentTableID];
          delete tableDiscount[currentTableID];

          // Bước E: Tải lại dữ liệu mới nhất từ Server
          loadData(); // Để bàn chuyển về màu xám (Trống)
          loadInvoiceHistory(); // Để hiện hóa đơn vừa thanh toán lên lịch sử

          // Đóng bảng chi tiết
          elements.tableDetails.classList.remove("active");
          currentTableID = null;

          showToast(
            `Thanh toán thành công: ${new Intl.NumberFormat("vi-VN").format(
              finalBill
            )}đ`,
            "success"
          );
        })
        .catch((err) => {
          console.error("Lỗi thanh toán:", err);
          showToast("Lỗi kết nối Server!", "error");
        });
    }
  );
});

// Chuyển bàn
elements.moveTableBtn.addEventListener("click", () => {
  if (!currentTableID) return;

  showPrompt(
    "Chuyển đến bàn nào?",
    "Nhập tên bàn muốn chuyển",
    (targetName) => {
      const allTables = document.querySelectorAll(".table");
      let targetTableEl = null;
      let targetTableID = null;

      allTables.forEach((table) => {
        const title = table.querySelector(".table__title").textContent;
        if (title.toLowerCase() === targetName.toLowerCase().trim()) {
          targetTableEl = table;
          targetTableID = table.querySelector(".table__header").dataset.id;
        }
      });

      if (!targetTableEl) {
        showAlert("Không tìm thấy bàn: " + targetName);
        return;
      }

      if (targetTableID === currentTableID) {
        showAlert("Không thể chuyển sang chính nó!");
        return;
      }

      // Kiểm tra bàn đích có đang bận không
      if (
        targetTableEl.classList.contains("table__playing") ||
        (tableMeals[targetTableID] && tableMeals[targetTableID].length > 0)
      ) {
        showAlert("Bàn đích đang có người chơi hoặc chưa thanh toán!");
        return;
      }

      showConfirm(`Chuyển tất cả từ bàn hiện sang ${targetName}?`, () => {
        tableMeals[targetTableID] = JSON.parse(
          JSON.stringify(tableMeals[currentTableID] || [])
        );
        if (tableDiscount[currentTableID])
          tableDiscount[targetTableID] = tableDiscount[currentTableID];

        const currentTableEl = document
          .querySelector(`.table__header[data-id="${currentTableID}"]`)
          .closest(".table");

        if (currentTableEl.classList.contains("table__playing")) {
          const currentSeconds = currentTableEl.currentSeconds || 0;

          clearInterval(currentTableEl.timerID);

          currentTableEl.classList.remove("table__playing");

          currentTableEl.querySelector(".table__status").textContent = "Trống";
          currentTableEl.querySelector(".table__start").textContent = "Start";
          currentTableEl.querySelector(".table__timer").textContent =
            "00:00:00";
          currentTableEl.currentSeconds = 0;

          currentPlaying--;
          elements.playingCount.textContent = currentPlaying;

          const startBtnNew = targetTableEl.querySelector(".table__start");
          const statusNew = targetTableEl.querySelector(".table__status");
          const timerNew = targetTableEl.querySelector(".table__timer");

          targetTableEl.currentSeconds = currentSeconds;
          handleTimer(targetTableEl, startBtnNew, statusNew, timerNew);
        } else {
          currentTableEl.querySelector(".table__status").textContent = "Trống";
          currentTableEl.classList.remove("table__playing");
        }

        delete tableMeals[currentTableID];
        delete tableStartTimes[currentTableID];
        delete tableProgress[currentTableID];
        delete tableDiscount[currentTableID];

        elements.tableDetails.classList.remove("active");
        currentTableID = null;
        showToast("Chuyển bàn thành công!", "success");

        saveData();
      });
    }
  );
});

// ==================== Details Menu HTML ============================
function renderDetailsMenu(dataRender = menuData) {
  const menuContainer = elements.detailsMenu;
  menuContainer.innerHTML = "";

  // Lọc theo category
  let filteredData = dataRender;
  if (selectedCategory !== "all") {
    filteredData = dataRender.filter(
      (item) => item.category === selectedCategory
    );
  }

  // Lọc theo search
  const searchTerm =
    elements.searchMenuDetail?.value.toLowerCase().trim() || "";
  if (searchTerm) {
    filteredData = filteredData.filter((item) =>
      item.name.toLowerCase().includes(searchTerm)
    );
  }

  if (filteredData.length === 0) {
    menuContainer.innerHTML = `
      <div class="empty-menu">
        <div class="empty-icon">🔍</div>
        <p>Không tìm thấy món nào</p>
      </div>
    `;
    return;
  }

  filteredData.forEach((item) => {
    const formattedPrice = new Intl.NumberFormat("vi-VN").format(item.price);

    const itemHTML = `
    <div class="menu__item" data-id="${item.id}">
      <div class="menu-item-info">
        <span class="menu-item-name">${item.name}</span>
        <span class="menu-item-price">${formattedPrice}đ</span>
      </div>
      <button class="add-order-btn" data-id="${item.id}">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>`;
    menuContainer.insertAdjacentHTML("beforeend", itemHTML);
  });
}

// ==================== Render Order Items ============================
function renderOrderItems() {
  if (
    !currentTableID ||
    !tableMeals[currentTableID] ||
    tableMeals[currentTableID].length === 0
  ) {
    elements.detailsOrder.innerHTML = `
      <div class="empty-order">
        <p>---Trống---</p>
        <span>Hãy chọn món từ menu bên trái</span>
      </div>
    `;
    elements.summaryItems.textContent = 0;
    elements.summaryPrice.textContent = "0đ";
    return;
  }

  const orders = tableMeals[currentTableID];
  let html = "";
  let totalPrice = 0;

  html += `
    <div class="order-header-row">
      <div class="col-name">Tên món</div>
      <div class="col-qty">SL</div>
      <div class="col-price">T.Tiền</div>
      <div class="col-action"></div>
    </div>
  `;

  orders.forEach((order) => {
    let itemTotal = 0;
    let unitPriceDisplay = "";

    if (order.category === "table") {
      itemTotal = order.totalPrice || 0;
      unitPriceDisplay =
        new Intl.NumberFormat("vi-VN").format(order.price) + "đ/giờ";
    } else {
      itemTotal = order.price * order.quantity;
      unitPriceDisplay =
        new Intl.NumberFormat("vi-VN").format(order.price) + "đ/món";
    }
    totalPrice += itemTotal;
    const formattedTotal = new Intl.NumberFormat("vi-VN").format(itemTotal);

    // kiểm tra xem có phải loại bàn không
    const isTable = order.category === "table";

    // nếu là bàn set read only và bỏ background
    const inputAttributes = isTable
      ? `readonly style="background: transparent;border: none; font-weight: bold;"`
      : `onfocus="this.select()"`;

    html += `
      <div class="order-row">
        <div class="col-name" title="${order.name}">${order.name}</div>
        
        <div class="col-qty">
          <input type="number" 
            class="qty-input-clean" 
            value="${order.quantity}" 
            min="1" 
            data-order-id="${order.id}"
            ${inputAttributes}" >
        </div>
        <div class="col-price">${formattedTotal}</div>       
        <div class="col-action">
          <button class="remove-order-btn" data-order-id="${order.id}"><img src="/assets/icon/close.svg" alt="Close"></button>
        </div>
      </div>
    `;
  });

  elements.detailsOrder.innerHTML = html;

  const discountPercent = tableDiscount[currentTableID] || 0;
  const discountAmount = Math.ceil(totalPrice * discountPercent) / 100;
  const finalPrice = totalPrice - discountAmount;

  // Hiển Thị Tổng Tiền
  const formattedTotal = new Intl.NumberFormat("vi-VN").format(totalPrice);
  const formattedFinal = new Intl.NumberFormat("vi-VN").format(finalPrice);

  elements.summaryItems.textContent = orders.reduce(
    (sum, order) => sum + Number(order.quantity),
    0
  );

  if (discountPercent > 0) {
    elements.summaryPrice.innerHTML = `
    <span style="text-decoration: line-through; color: #999; font-size: 0.8em;">${formattedTotal}đ</span>
        <br>
        <span>${formattedFinal}đ</span>
    `;
  } else {
    elements.summaryPrice.textContent = formattedTotal + "đ";
  }

  saveData();
}

// ==================== Open Table Details ============================
function getCurrentDateTimeInput() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function openTableDetails(tableElement) {
  const tableHeader = tableElement.querySelector(".table__header");
  currentTableID = tableHeader.dataset.id;

  const tableTitle = tableElement.querySelector(".table__title").textContent;
  const tableTime = tableElement.querySelector(".table__timer").textContent;
  const isPlaying = tableElement.classList.contains("table__playing");

  const startTimeInput = document.getElementById("summary-start-time");

  if (tableStartTimes[currentTableID]) {
    startTimeInput.value = tableStartTimes[currentTableID];
  } else {
    startTimeInput.value = getCurrentDateTimeInput();
  }

  if (isPlaying) {
    startTimeInput.disabled = false;
    startTimeInput.style.cursor = "pointer";
  } else {
    startTimeInput.disabled = true;
    startTimeInput.style.cursor = "default";
  }

  elements.detailsTableTitle.textContent = `${tableTitle} - Chi tiết`;
  elements.summaryTime.textContent = tableTime;

  // Cập nhật nút Start/Stop
  if (isPlaying) {
    elements.startStopBtn.textContent = "Dừng lại";
    elements.startStopBtn.classList.add("btn-stop");
    elements.startStopBtn.classList.remove("btn-start");
  } else {
    elements.startStopBtn.textContent = "Bắt đầu";
    elements.startStopBtn.classList.add("btn-start");
    elements.startStopBtn.classList.remove("btn-stop");
  }

  if (!tableMeals[currentTableID]) {
    tableMeals[currentTableID] = [];
  }

  selectedCategory = "all";
  renderDetailsMenu();
  renderOrderItems();

  elements.tableDetails.classList.add("active");

  // reset nút giảm giá
  elements.discountBtn.textContent = "Giảm giá";
  elements.discountBtn.style.background = "";

  if (tableDiscount[currentTableID]) {
    elements.discountBtn.textContent = `Giảm ${tableDiscount[currentTableID]}%`;
    elements.discountBtn.style.background = "#e53e3e";
  }
}

// ==================== Add Order Handler ============================
elements.detailsMenu.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-order-btn");
  if (addBtn) {
    const itemId = Number(addBtn.dataset.id);
    const menuItem = menuData.find((item) => item.id === itemId);

    if (menuItem && currentTableID) {
      if (!tableMeals[currentTableID]) {
        tableMeals[currentTableID] = [];
      }

      const currentOrders = tableMeals[currentTableID];

      if (menuItem.category == "table") {
        const existingTableIndex = currentOrders.findIndex(
          (order) => order.category === "table"
        );
        if (existingTableIndex !== -1) {
          const existingItem = currentOrders[existingTableIndex];
          if (existingItem.id === itemId) {
            return;
          }
          existingItem.id = menuItem.id;
          existingItem.name = menuItem.name;
          existingItem.price = menuItem.price;
        } else {
          currentOrders.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            category: menuItem.category,
            quantity: 1,
            totalPrice: 0,
          });
        }
      } else {
        const existingOrder = currentOrders.find(
          (order) => order.id === itemId
        );
        if (existingOrder) {
          existingOrder.quantity++;
        } else {
          currentOrders.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            category: menuItem.category,
            quantity: 1,
          });
        }
      }
      renderOrderItems();
    }
  }
});

// ==================== Update Quantity & Remove Order Handler ===========
elements.detailsOrder.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-order-btn");
  if (removeBtn) {
    const orderId = Number(removeBtn.dataset.orderId);

    if (currentTableID && tableMeals[currentTableID]) {
      tableMeals[currentTableID] = tableMeals[currentTableID].filter(
        (order) => order.id !== orderId
      );
      renderOrderItems();
    }
  }
});

// Handle quantity input change
elements.detailsOrder.addEventListener("input", (e) => {
  if (e.target.classList.contains("qty-input-clean")) {
    const orderId = Number(e.target.dataset.orderId);
    let newQuantity = parseInt(e.target.value);

    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }

    if (currentTableID && tableMeals[currentTableID]) {
      const order = tableMeals[currentTableID].find((o) => o.id === orderId);
      if (order) {
        order.quantity = newQuantity;
        renderOrderItems();
      }
    }
  }
});

// ==================== Category Filter Handler ============================
elements.menuCategoryFilter?.addEventListener("change", (e) => {
  selectedCategory = e.target.value;
  renderDetailsMenu();
});

// ==================== Search Menu in Detail ============================
elements.searchMenuDetail?.addEventListener("input", () => {
  renderDetailsMenu();
});

// ==================== Start/Stop Button Handler ============================
elements.startStopBtn?.addEventListener("click", () => {
  if (!currentTableID) return;

  // Tìm table element tương ứng
  const tableElement = document
    .querySelector(`[data-id="${currentTableID}"]`)
    ?.closest(".table");
  if (!tableElement) return;

  const startButton = tableElement.querySelector(".table__start");
  const statusText = tableElement.querySelector(".table__status");
  const timeCount = tableElement.querySelector(".table__timer");

  // Trigger click vào nút start/stop bên ngoài
  handleTimer(tableElement, startButton, statusText, timeCount);

  // Cập nhật lại giao diện modal
  const isPlaying = tableElement.classList.contains("table__playing");

  const timeInput = document.getElementById("summary-start-time");

  if (isPlaying) {
    elements.startStopBtn.textContent = "Dừng lại";
    elements.startStopBtn.classList.add("btn-stop");
    elements.startStopBtn.classList.remove("btn-start");
    if (timeInput) {
      timeInput.disabled = false;
      timeInput.style.cursor = "pointer";
    }
  } else {
    elements.startStopBtn.textContent = "Bắt đầu";
    elements.startStopBtn.classList.add("btn-start");
    elements.startStopBtn.classList.remove("btn-stop");
    if (timeInput) {
      timeInput.disabled = true;
      timeInput.style.cursor = "default";
    }
  }
});

// ==================== Menu HTML ============================
function renderMenu(dataRender = menuData) {
  elements.menuItemList.innerHTML = "";

  if (dataRender.length === 0) {
    elements.menuItemList.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
        <div style="font-size: 1.4rem; margin-top: 10px;">Không tìm thấy món nào</div>
      </div>
    `;
    return;
  }

  dataRender.forEach((item) => {
    let badgeClass = "badge-other";
    let categoryName = "Khác";

    if (item.category === "food") {
      badgeClass = "badge-food";
      categoryName = "Đồ ăn";
    } else if (item.category === "drink") {
      badgeClass = "badge-drink";
      categoryName = "Đồ uống";
    } else if (item.category === "tobacco") {
      badgeClass = "badge-tobacco";
      categoryName = "Thuốc lá";
    } else if (item.category === "table") {
      badgeClass = "badge-table";
      categoryName = "Loại bàn";
    }

    const formattedPrice = new Intl.NumberFormat("vi-VN").format(item.price);
    const itemHTML = `
    <div class="menu-item-card">
        <div class="menu-item-info">
          <h4>${item.name}</h4>
          <span class="item-category-badge ${badgeClass}">${categoryName}</span>
        </div>        
        <div class="menu-item-price">${formattedPrice}đ</div>       
        <div class="menu-item-actions">
          <button class="btn-icon btn-edit-item" data-id="${item.id}" title="Sửa"> Sửa
            <img src="./assets/icon/edit.svg" alt="Sửa">
          </button>
          <button class="btn-icon btn-delete-item" data-id="${item.id}" title="Xóa"> Xóa
            <img src="./assets/icon/delete.svg" alt="Xóa">
          </button>
        </div>
      </div>`;

    elements.menuItemList.insertAdjacentHTML("beforeend", itemHTML);
  });
}

// ==================== Search Menu ==========================
elements.searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  const filterData = menuData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm)
  );
  renderMenu(filterData);
});

// Localstorage
function saveMenu() {
  localStorage.setItem("menuData", JSON.stringify(menuData));
}

async function loadMenu() {
  try {
    const response = await fetch("http://localhost:3000/api/menu");
    menuData = await response.json();
    renderMenu();
  } catch (error) {
    console.error("Lỗi tải menu", error);
  }
}

// ==================== Handlers Menu ========================
elements.manageMenuBtn.addEventListener("click", () => {
  closeSidebar();
  renderMenu();
  elements.manageMenuModal.classList.add("active");
});

elements.closeMenuBtn.addEventListener("click", () => {
  elements.manageMenuModal.classList.remove("active");
});

elements.openMenuBtn.addEventListener("click", () => {
  editItem = null;
  document.querySelector("#add-menu-modal h2").textContent = "Thêm món";
  elements.menuNameInput.value = "";
  elements.menuPriceInput.value = "";
  elements.menuCategoryInput.value = "food";
  document.getElementById("add-menu-modal").classList.add("active");
});

elements.cancelAddMenu.addEventListener("click", () => {
  document.getElementById("add-menu-modal").classList.remove("active");
  editItem = null;
});

elements.addMenuForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = elements.menuNameInput.value.trim();
  const price = Number(elements.menuPriceInput.value);
  const category = elements.menuCategoryInput.value;

  if (!name) {
    showAlert("Vui lòng nhập tên món!");
    elements.menuNameInput.focus();
    return;
  }

  const itemData = { name, price, category };
  if (editItem) {
    fetch(`http://localhost:3000/api/menu/${editItem}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    }).then((res) => {
      if (res.ok) {
        loadMenu();
        document.getElementById("add-menu-modal").classList.remove("active");
        editItem = null;
        showToast("Đã sửa món thành công!");
      }
    });
  } else {
    fetch("http://localhost:3000/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    }).then((res) => {
      if (res.ok) {
        loadMenu();
        document.getElementById("add-menu-modal").classList.remove("active");
        showToast("Đã thêm món mới!");
      }
    });
  }
});

// Delete/Edit item
elements.menuItemList.addEventListener("click", (e) => {
  // Edit
  const editBtn = e.target.closest(".btn-edit-item");
  if (editBtn) {
    const idItem = Number(editBtn.dataset.id);
    const item = menuData.find((m) => m.id === idItem);

    if (item) {
      editItem = item.id;
      document.querySelector("#add-menu-modal h2").textContent = "Sửa món";
      elements.menuNameInput.value = item.name;
      elements.menuPriceInput.value = item.price;
      elements.menuCategoryInput.value = item.category;
      document.getElementById("add-menu-modal").classList.add("active");
    }
    return;
  }

  // Delete
  const deleteBtn = e.target.closest(".btn-delete-item");
  if (deleteBtn) {
    const idDelete = Number(deleteBtn.dataset.id);
    const itemToDelete = menuData.find((m) => m.id === idDelete);
    if (itemToDelete) {
      itemDeleteID = idDelete;
      tableDelete = null;
      elements.deleteTableName.textContent = `Món ${itemToDelete.name}`;
      elements.deleteModal.classList.add("active");
    }
  }
});

loadMenu();

// ==================== Utility Functions ====================
function loadInvoiceHistory() {
  fetch("http://localhost:3000/api/invoices")
    .then((res) => res.json())
    .then((invoices) => {
      // Xóa danh sách cũ trên giao diện
      const historyList = document.querySelector(".history-list"); // Kiểm tra lại class trong HTML của bạn
      if (!historyList) return;
      historyList.innerHTML = "";

      // Tính tổng doanh thu từ database luôn
      let totalRevenue = 0;

      invoices.forEach((inv) => {
        totalRevenue += inv.final_amount;

        // Vẽ từng hóa đơn ra
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = `
                    <div class="history-info">
                        <strong>${inv.table_name}</strong> <br>
                        <small>${new Date(inv.payment_time).toLocaleString(
                          "vi-VN"
                        )}</small>
                    </div>
                    <div class="history-price">
                        ${new Intl.NumberFormat("vi-VN").format(
                          inv.final_amount
                        )}đ
                    </div>
                `;
        historyList.appendChild(item);
      });

      // Cập nhật số tổng doanh thu lên màn hình
      const revenueEl = document.getElementById("daily-revenue");
      if (revenueEl) {
        revenueEl.textContent =
          new Intl.NumberFormat("vi-VN").format(totalRevenue) + "đ";
      }
    })
    .catch((err) => console.error("Lỗi tải lịch sử:", err));
}

function formatTime(countTime) {
  const hours = Math.floor(countTime / 3600);
  const minutes = Math.floor((countTime % 3600) / 60);
  const seconds = countTime % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

function closeAllMenu(currentMenu = null) {
  document.querySelectorAll(".table__menu.active").forEach((menu) => {
    if (menu !== currentMenu) {
      menu.classList.remove("active");
    }
  });
}

function getInvoiceCode(id) {
  return `HD${id}`;
}

function saveData() {
  // Lưu danh sách các bàn hiện có
  const tablesList = [];
  document.querySelectorAll(".table").forEach((el) => {
    const header = el.querySelector(".table__header");
    const body = el.querySelector(".table__body");

    if (header && body) {
      const id = header.dataset.id;
      const name = header.querySelector(".table__title").textContent;
      const typeText = body.querySelector(".table__type").textContent;
      const type = typeText
        .replace("Loại: ", "")
        .replace("Loại bàn: ", "")
        .trim();

      tablesList.push({ id, name, type });
    }
  });

  // Đóng gói tất cả dữ liệu
  const dataToSave = {
    menuData: menuData,
    tablesList: tablesList,
    tableMeals: tableMeals,
    tableStartTimes: tableStartTimes,
    tableDiscount: tableDiscount,
    invoiceHistory: invoiceHistory,
    dailyRevenue: dailyRevenue,
    currentTables: currentTables,
  };

  // Lưu vào localStorage
  localStorage.setItem("billiards_data", JSON.stringify(dataToSave));
}

async function loadData() {
  try {
    const response = await fetch("http://localhost:3000/api/tables");
    const dbTables = await response.json();

    // Cập nhật số bàn
    currentTables = dbTables.length;
    if (elements.tablesCount) elements.tablesCount.textContent = currentTables;

    // Reset danh sách và biến đếm số bàn đang chơi
    elements.tableList.innerHTML = "";
    currentPlaying = 0;

    dbTables.forEach((t) => {
      // 1. Render HTML cơ bản
      const html = `
        <div class="table">
          <div class="table__header" data-id="${t.id}">
            <h3 class="table__title">${t.name}</h3>
            <div class="table__menu"><button class="table__toggle">⋮</button></div>
          </div>
          <div class="table__body">
            <span>Giờ chơi: <span class="table__timer">00:00:00</span></span>
            <span class="table__type">Loại bàn: ${t.type}</span>
            <span>Trạng thái: <span class="table__status">${t.status}</span></span>
          </div>
          <button class="table__start">Start</button>
        </div>
      `;
      elements.tableList.insertAdjacentHTML("beforeend", html);

      // 2. KÍCH HOẠT LẠI TRẠNG THÁI NẾU ĐANG CHƠI
      if (t.status === "Đang chơi") {
        const tableHeader =
          elements.tableList.lastElementChild.querySelector(".table__header");
        const tableContainer = tableHeader.parentElement;
        const timeCount = tableContainer.querySelector(".table__timer");
        const startButton = tableContainer.querySelector(".table__start");
        const statusText = tableContainer.querySelector(".table__status");

        // Cập nhật giao diện
        tableContainer.classList.add("table__playing");
        startButton.textContent = "Stop";
        statusText.textContent = "Đang chơi";

        let seconds = t.play_seconds ? t.play_seconds : 0;

        tableContainer.currentSeconds = seconds;
        timeCount.textContent = formatTime(seconds);

        if (t.start_time_str) {
          tableStartTimes[t.id] = t.start_time_str.replace(" ", "T");
        }
        currentPlaying++;

        // Chạy đồng hồ
        if (tableContainer.timerID) clearInterval(tableContainer.timerID);
        tableContainer.timerID = setInterval(() => {
          tableContainer.currentSeconds++;
          timeCount.textContent = formatTime(tableContainer.currentSeconds);
        }, 1000);
      }
    });

    // Cập nhật số bàn đang chơi lên header
    if (elements.playingCount)
      elements.playingCount.textContent = currentPlaying;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
  }
}

// Gọi APT cập nhật
async function updateTableStatus(id, status, startTime) {
  try {
    await fetch(`http://localhost:3000/api/tables/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: status,
      }),
    });
    console.log(`Đã lưu trạng thái bàn ${id}: ${status}`);
  } catch (error) {
    console.error("Lỗi lưu trạng thái:", error);
  }
}

// ==================== Table HTML Template ====================
function createTableHTML(name, type) {
  const tableID = Date.now();

  return `
    <div class="table__header" data-id="${tableID}">
      <h3 class="table__title">${name}</h3>
      <div class="table__menu">
        <button class="table__toggle">
          <img src="./assets/icon/3dot.svg" alt="Menu" />
        </button>
        <div class="table__drop">
          <a href="#" class="table__edit">
            <img src="./assets/icon/edit.svg" alt="Edit" />Edit
          </a>
          <a href="#" class="table__delete">
            <img src="./assets/icon/delete.svg" alt="Delete" />Delete
          </a>
        </div>
      </div>
    </div>
    <div class="table__body">
      <span>Giờ chơi: <span class="table__timer">00:00:00</span></span>
      <span class="table__type">Loại bàn: ${type}</span>
      <span>Trạng thái: <span class="table__status">Trống</span></span>
    </div>
    <button class="table__start">Start</button>
  `;
}

// ==================== Table Timer Handler ====================
function roundMoney(amount) {
  return Math.ceil(amount / 1000) * 1000;
}

function handleTimer(tableContainer, startButton, statusText, timeCount) {
  const playing = tableContainer.classList.toggle("table__playing");
  const tableHeader = tableContainer.querySelector(".table__header");
  const tableID = tableHeader.dataset.id;

  if (playing) {
    startButton.textContent = "Stop";
    statusText.textContent = "Đang chơi";

    if (!tableStartTimes[tableID]) {
      tableStartTimes[tableID] = getCurrentDateTimeInput();
    }

    updateTableStatus(tableID, "Đang chơi");

    currentPlaying++;
    elements.playingCount.textContent = currentPlaying;

    tableContainer.timerID = setInterval(() => {
      // Lấy số giấy hiện tại trực tiếp từ thẻ HTML
      let currentVal = tableContainer.currentSeconds || 0;
      // cộng thêm 1 giây
      currentVal++;
      // lưu ngược lại
      tableContainer.currentSeconds = currentVal;
      // Hiện thị
      timeCount.textContent = formatTime(currentVal);

      if (tableMeals[tableID]) {
        const tableItem = tableMeals[tableID].find(
          (item) => item.category === "table"
        );
        if (tableItem) {
          const hoursPlayed = currentVal / 3600;
          tableItem.totalPrice = roundMoney(hoursPlayed * tableItem.price);
        }
      }

      // Cập nhật thời gian trong modal nếu đang mở
      if (
        currentTableID === tableID &&
        elements.tableDetails.classList.contains("active")
      ) {
        elements.summaryTime.textContent = formatTime(currentVal);
        renderOrderItems();
      }
    }, 1000);
  } else {
    startButton.textContent = "Start";
    statusText.textContent = "Trống";
    clearInterval(tableContainer.timerID);

    delete tableStartTimes[tableID];

    updateTableStatus(tableID, "Trống");

    currentPlaying--;
    elements.playingCount.textContent = currentPlaying;
  }
}

// ==================== Event Handlers ====================
// Menu toggle handler
elements.menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  closeAllMenu();
  elements.menuContainer.classList.toggle("active");
});

// Modal handlers
if (elements.sidebarAddTable) {
  elements.sidebarAddTable.addEventListener("click", () => {
    closeSidebar();

    tableUpdate = null;
    elements.modalTitle.textContent = "Thêm bàn mới";
    elements.modalUpdate.textContent = "Thêm";
    elements.tableName.value = "";
    elements.tableType.value = "";
    elements.modal.classList.add("active");
  });
}

elements.cancelBtn.addEventListener("click", () => {
  elements.modal.classList.remove("active");
});

// Add table form handler
elements.addTableForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = elements.tableName.value;
  const type = elements.tableType.value;

  if (tableUpdate) {
    const titleElement = tableUpdate.querySelector(".table__title");
    const typeElement = tableUpdate.querySelector(".table__type");
    titleElement.textContent = name;
    typeElement.textContent = `Loại bàn: ${type}`;
  } else {
    const table = document.createElement("div");
    table.classList.add("table");
    table.innerHTML = createTableHTML(name, type);

    elements.tableList.append(table);

    currentTables++;
    elements.tablesCount.textContent = currentTables;
  }

  elements.modal.classList.remove("active");
  elements.tableName.value = "";
  elements.tableType.value = "";
  tableUpdate = null;

  saveData();
});

// Button cancel confirm delete table
elements.deleteCancel.addEventListener("click", () => {
  elements.deleteModal.classList.remove("active");
  tableDelete = null;
  itemDeleteID = null;
});

// Button submit confirm delete table
elements.deleteSubmit.addEventListener("click", () => {
  if (tableDelete) {
    if (tableDelete.classList.contains("table__playing")) {
      currentPlaying--;
      elements.playingCount.textContent = currentPlaying;
    }
    currentTables--;
    elements.tablesCount.textContent = currentTables;
    tableDelete.remove();
    tableDelete = null;

    elements.deleteModal.classList.remove("active");
    return;
  }

  if (itemDeleteID) {
    fetch("http://localhost:3000/api/tables/delete", {
      method: "DELETE",
    }).then((res) => {
      if (res.ok) {
        loadMenu();
        renderDetailsMenu();
        itemDeleteID = null;
        elements.deleteModal.classList.remove("active");
        showToast("Đã xóa món!");
      }
    });
  }
});

// Table list event delegation
elements.tableList.addEventListener("click", (e) => {
  // Handle menu toggle
  const toggleButton = e.target.closest(".table__toggle");
  if (toggleButton) {
    e.stopPropagation();
    elements.menuContainer.classList.remove("active");
    const tableMenu = toggleButton.closest(".table__menu");
    closeAllMenu(tableMenu);
    tableMenu.classList.toggle("active");
    return;
  }

  // Handle start/stop button
  const startButton = e.target.closest(".table__start");
  if (startButton) {
    const table = startButton.closest(".table");
    const statusText = table.querySelector(".table__status");
    const timeCount = table.querySelector(".table__timer");
    handleTimer(table, startButton, statusText, timeCount);
    return;
  }

  // Delete tables
  const deleteButton = e.target.closest(".table__delete");
  if (deleteButton) {
    e.preventDefault();
    tableDelete = deleteButton.closest(".table");
    const tableName = tableDelete.querySelector(".table__title").textContent;
    elements.deleteTableName.textContent = `${tableName}`;
    elements.deleteModal.classList.add("active");
    return;
  }

  // Edit table
  const editButton = e.target.closest(".table__edit");
  if (editButton) {
    e.preventDefault();
    tableUpdate = editButton.closest(".table");
    const currentName = tableUpdate.querySelector(".table__title").textContent;
    let currentTypeRaw = tableUpdate.querySelector(".table__type").textContent;
    let currentType = currentTypeRaw.replace("Loại bàn: ", "");

    elements.tableName.value = currentName;
    elements.tableType.value = currentType;
    elements.modalTitle.textContent = "Cập nhật bàn";
    elements.modalUpdate.textContent = "Cập nhật";
    elements.modal.classList.add("active");
    return;
  }

  // Open table details - Click anywhere on table card
  const clickedTable = e.target.closest(".table");
  if (clickedTable) {
    openTableDetails(clickedTable);
  }
});

// Close detail bill
elements.closeDetailBtn.addEventListener("click", () => {
  elements.tableDetails.classList.remove("active");
  currentTableID = null;
});

// ==================Phục hồi dữ liệu tuừ localStorage ==================
function loadSavedData() {
  const saved = localStorage.getItem("billiards_data");
  if (saved) {
    const data = JSON.parse(saved);

    // 1. Lấy lại Lịch sử hóa đơn
    if (data.invoiceHistory) {
      invoiceHistory = data.invoiceHistory;
    }

    // 2. Lấy lại Doanh thu trong ngày
    if (data.dailyRevenue) {
      dailyRevenue = data.dailyRevenue;
      // Cập nhật lên màn hình
      const revenueEl = document.getElementById("daily-revenue"); // Kiểm tra lại ID trong file HTML của bạn
      if (revenueEl) {
        revenueEl.textContent =
          new Intl.NumberFormat("vi-VN").format(dailyRevenue) + "đ";
      }
    }
    if (data.tableMeals) tableMeals = data.tableMeals;
    if (data.tableDiscount) tableDiscount = data.tableDiscount;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  loadMenu();
  loadInvoiceHistory();
});

const userRole = localStorage.getItem("user_role");
const userName = localStorage.getItem("user_name");
if (!userRole) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const nameDisplay = document.getElementById("dropdown-username");
  if (nameDisplay && userName) {
    nameDisplay.textContent = `Xin chào, ${userName}`;
  }
});

function logout() {
  showConfirm("Bạn có chắc muốn đăng xuất?", function () {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// ==========================
const timeInputForEdit = document.getElementById("summary-start-time");

if (timeInputForEdit) {
  timeInputForEdit.addEventListener("click", function () {
    try {
      this.showPicker();
    } catch (err) {
      console.log("Trình duyệt không hỗ trợ showPicker");
    }
  });
  timeInputForEdit.addEventListener("change", (e) => {
    if (!currentTableID) return;

    const newTimeStr = e.target.value; // Lúc nào cũng dạng: "2023-12-16T15:30"
    if (!newTimeStr) return;

    // 1. Cập nhật ngay vào biến lưu trữ (để lần sau mở lại vẫn thấy giờ mới)
    tableStartTimes[currentTableID] = newTimeStr;

    // 2. Tính toán số giây chênh lệch
    const now = new Date();
    const newStartDate = new Date(newTimeStr);
    let diffSeconds = Math.floor((now - newStartDate) / 1000);

    // Chặn tương lai
    if (diffSeconds < 0) {
      showToast("Không thể chọn giờ tương lai!", "error");
      // Trả lại giờ hiện tại nếu sai
      e.target.value = getCurrentDateTimeInput();
      return;
    }

    // 3. Cập nhật hiển thị trên giao diện bàn
    const tableElement = document
      .querySelector(`.table__header[data-id="${currentTableID}"]`)
      .closest(".table");

    tableElement.currentSeconds = diffSeconds;

    // Cập nhật text đếm giờ trong modal
    if (elements.summaryTime)
      elements.summaryTime.textContent = formatTime(diffSeconds);

    // Tính lại tiền
    if (tableMeals[currentTableID]) {
      const tableItem = tableMeals[currentTableID].find(
        (item) => item.category === "table"
      );
      if (tableItem) {
        const hoursPlayed = diffSeconds / 3600;
        tableItem.totalPrice = roundMoney(hoursPlayed * tableItem.price);
      }
    }
    renderOrderItems();

    // 4. Gửi lên Server (Đổi T thành khoảng trắng để MySQL hiểu)
    const timeForServer = newTimeStr.replace("T", " ");

    fetch(`http://localhost:3000/api/tables/${currentTableID}/update-time`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_time: timeForServer }),
    }).then((res) => {
      if (res.ok) showToast("Đã cập nhật giờ!", "success");
      else showToast("Lỗi server!", "error");
    });
  });
}

// Close menus when clicking outside
window.addEventListener("click", () => {
  elements.menuContainer.classList.remove("active");
  closeAllMenu();
});
