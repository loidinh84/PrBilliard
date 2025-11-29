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

// Menu mẫu
let menuData = [
  { id: 1, name: "Cà phê đá", price: 25000, category: "drink" },
  { id: 2, name: "Mì xào bò", price: 45000, category: "food" },
  { id: 3, name: "Thuốc lá 555", price: 30000, category: "tobacco" },
  { id: 4, name: "Bàn Lỗ - 1 giờ", price: 50000, category: "table" },
  { id: 5, name: "Bàn Phăng - 1 giờ", price: 60000, category: "table" },
];

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
  elements.summaryItems.textContent = orders.length;

  const totalQuantity = orders.reduce((sum, order) => {
    return sum + Number(order.quantity);
  }, 0);

  elements.summaryItems.textContent = totalQuantity;

  // Cập nhật tổng tiền
  elements.summaryPrice.textContent =
    new Intl.NumberFormat("vi-VN").format(totalPrice) + "đ";
}

// ==================== Open Table Details ============================
function openTableDetails(tableElement) {
  const tableHeader = tableElement.querySelector(".table__header");
  currentTableID = tableHeader.dataset.id;

  const tableTitle = tableElement.querySelector(".table__title").textContent;
  const tableTime = tableElement.querySelector(".table__timer").textContent;
  const isPlaying = tableElement.classList.contains("table__playing");

  elements.detailsTableTitle.textContent = `${tableTitle} - Chi tiết`;
  elements.summaryTime.textContent = tableTime;

  // Hiển thị giờ bắt đầu
  if (tableStartTimes[currentTableID]) {
    elements.summaryStartTime.textContent = tableStartTimes[currentTableID];
  } else {
    elements.summaryStartTime.textContent = getCurrentTime();
  }

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
  if (isPlaying) {
    elements.startStopBtn.textContent = "Dừng lại";
    elements.startStopBtn.classList.add("btn-stop");
    elements.startStopBtn.classList.remove("btn-start");
  } else {
    elements.startStopBtn.textContent = "Bắt đầu";
    elements.startStopBtn.classList.add("btn-start");
    elements.startStopBtn.classList.remove("btn-stop");
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

function loadMenu() {
  const saved = localStorage.getItem("menuData");
  if (saved) {
    menuData = JSON.parse(saved);
  }
}

// ==================== Handlers Menu ========================
elements.manageMenuBtn.addEventListener("click", () => {
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
    alert("Vui lòng nhập tên món!");
    elements.menuNameInput.focus();
    return;
  }

  if (!price || price < 0) {
    alert("Giá tiền không hợp lệ!");
    elements.menuPriceInput.focus();
    return;
  }

  if (editItem) {
    const item = menuData.find((m) => m.id === editItem);
    if (item) {
      item.name = name;
      item.price = price;
      item.category = category;
    }
  } else {
    const newItem = {
      id: Date.now(),
      name: name,
      price: price,
      category: category,
    };
    menuData.push(newItem);
  }
  saveMenu();
  renderMenu();
  document.getElementById("add-menu-modal").classList.remove("active");
  editItem = null;
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
function formatTime(countTime) {
  const hours = Math.floor(countTime / 3600);
  const minutes = Math.floor((countTime % 3600) / 60);
  const seconds = countTime % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function closeAllMenu(currentMenu = null) {
  document.querySelectorAll(".table__menu.active").forEach((menu) => {
    if (menu !== currentMenu) {
      menu.classList.remove("active");
    }
  });
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
function handleTimer(tableContainer, startButton, statusText, timeCount) {
  const playing = tableContainer.classList.toggle("table__playing");
  const tableHeader = tableContainer.querySelector(".table__header");
  const tableID = tableHeader.dataset.id;

  if (playing) {
    startButton.textContent = "Stop";
    statusText.textContent = "Đang chơi";

    if (!tableStartTimes[tableID]) {
      tableStartTimes[tableID] = getCurrentTime();
    }
    currentPlaying++;
    elements.playingCount.textContent = currentPlaying;

    // Lấy số giây cũ để chạy tiếp, hoặc bắt đầu từ 0
    let second = tableContainer.currentSeconds || 0;

    tableContainer.timerID = setInterval(() => {
      // lưu số giây hiện tại
      tableContainer.currentSeconds = second;
      timeCount.textContent = formatTime(++second);

      if (tableMeals[tableID]) {
        const tableItem = tableMeals[tableID].find(
          (item) => item.category === "table"
        );
        if (tableItem) {
          const hoursPlayed = second / 3600;
          tableItem.totalPrice = Math.round(hoursPlayed * tableItem.price);
        }
      }

      // Cập nhật thời gian trong modal nếu đang mở
      if (
        currentTableID === tableID &&
        elements.tableDetails.classList.contains("active")
      ) {
        elements.summaryTime.textContent = formatTime(second);
        renderOrderItems();
      }
    }, 1000);
  } else {
    startButton.textContent = "Start";
    statusText.textContent = "Trống";
    clearInterval(tableContainer.timerID);

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
elements.addBtn.addEventListener("click", () => {
  tableUpdate = null;
  elements.modalTitle.textContent = "Thêm bàn mới";
  elements.modalUpdate.textContent = "Thêm";
  elements.tableName.value = "";
  elements.tableType.value = "";
  elements.modal.classList.add("active");
});

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
    menuData = menuData.filter((item) => item.id !== itemDeleteID);
    saveMenu();
    renderMenu();
    renderDetailsMenu();

    itemDeleteID = null;
    elements.deleteModal.classList.remove("active");
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

// Close menus when clicking outside
window.addEventListener("click", () => {
  elements.menuContainer.classList.remove("active");
  closeAllMenu();
});
