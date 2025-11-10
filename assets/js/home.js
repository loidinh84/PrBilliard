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
};

let currentPlaying = 0;
let currentTables = 0;
let tableDelete = null;
let tableUpdate = null;

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
