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
};

let currentPlaying = 0;
let currentTables = 0;
let tableDelete = null;
let tableUpdate = null;
let editItem = null;

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

// Menu mẫu
let menuData = [
  { id: 1, name: "Cà phê đá", price: 25000, category: "drink" },
  { id: 2, name: "Mì xào bò", price: 45000, category: "food" },
  { id: 3, name: "Thuốc lá 555", price: 30000, category: "tobacco" },
];

// ==================== Search Menu ==========================
elements.searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();

  const filterData = menuData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm)
  );
  renderMenu(filterData);
});

// ==================== Menu HTML ============================
function renderMenu(dataRender = menuData) {
  elements.menuItemList.innerHTML = "";

  if (dataRender.length === 0) {
    elements.menuItemList.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
        <div style="font-size: 40px;">🔍</div>
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

// ==================== Handlers Menu ========================

elements.manageMenuBtn.addEventListener("click", () => {
  renderMenu();
  elements.manageMenuModal.classList.add("active");
});

elements.closeMenuBtn.addEventListener("click", () => {
  elements.manageMenuModal.classList.remove("active");

  // elements.addMenuForm.classList.add("hidden");
  // elements.openMenuBtn.style.display = "block";
});

elements.openMenuBtn.addEventListener("click", () => {
  editingItemId = null;
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

    if (confirm(`Bạn chắc chắn muốn xóa "${itemToDelete.name}"?`)) {
      menuData = menuData.filter((item) => item.id !== idDelete);
      saveMenuToStorage();
      renderMenu();
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

function closeAllMenu(currentMenu = null) {
  document.querySelectorAll(".table__menu.active").forEach((menu) => {
    if (menu !== currentMenu) {
      menu.classList.remove("active");
    }
  });
}

// ==================== Table HTML Template ====================
function createTableHTML(name, type) {
  return `
    <div class="table__header">
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

  if (playing) {
    startButton.textContent = "Stop";
    statusText.textContent = "Đang chơi";

    currentPlaying++;
    elements.playingCount.textContent = currentPlaying;

    let second = 0;

    tableContainer.timerID = setInterval(() => {
      timeCount.textContent = formatTime(++second);
      tableContainer.currentSeconds = second;
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

  // console.log("Tên bàn đã nhập:", name);
  // console.log("Loại bàn đã nhập:", type);

  // const newTable = document.createElement("div");
  // newTable.classList.add("table");
  // newTable.innerHTML = createTableHTML(name, type);
  // elements.tableList.append(newTable);

  elements.modal.classList.remove("active");

  // Reset form
  elements.tableName.value = "";
  elements.tableType.value = "";

  tableUpdate = null;
});

// Button cancel confirm delete table
elements.deleteCancel.addEventListener("click", () => {
  elements.deleteModal.classList.remove("active");
  tableDelete = null;
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
    elements.deleteModal.classList.remove("active");
    tableDelete = null;
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
  }

  // Delete tables
  const deleteButton = e.target.closest(".table__delete");
  if (deleteButton) {
    tableDelete = deleteButton.closest(".table");
    const tableName = tableDelete.querySelector(".table__title").textContent;
    elements.deleteTableName.textContent = `${tableName}`;
    elements.deleteModal.classList.add("active");
  }

  // Edit table
  const editButton = e.target.closest(".table__edit");
  if (editButton) {
    tableUpdate = editButton.closest(".table");
    const currentName = tableUpdate.querySelector(".table__title").textContent;
    let currentTypeRaw = tableUpdate.querySelector(".table__type").textContent;
    let currentType = currentTypeRaw.replace("Loại bàn: ", "");

    elements.tableName.value = currentName;
    elements.tableType.value = currentType;

    elements.modalTitle.textContent = "Cập nhật bàn";
    elements.modalUpdate.textContent = "Cập nhật";

    elements.modal.classList.add("active");
  }
});

// Close menus when clicking outside
window.addEventListener("click", () => {
  elements.menuContainer.classList.remove("active");
  closeAllMenu();
});
