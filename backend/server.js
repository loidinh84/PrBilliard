const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 1. Cấu hình kết nối MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456", // <-- Kiểm tra lại pass của bạn
  database: "billiards_db",
});

// 2. Kết nối Database
db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối MySQL:", err);
    return;
  }
  console.log("Kết nối MySQL thành công!");
});

// ================= API ROUTES =================

// API 1: LẤY DANH SÁCH BÀN (Tính toán số giây đã chơi)
app.get("/api/tables", (req, res) => {
  const sql = `
        SELECT 
            id, 
            name, 
            type, 
            status, 
            DATE_FORMAT(start_time, '%Y-%m-%d %T') as start_time_str,
            TIMESTAMPDIFF(SECOND, start_time, NOW()) as play_seconds 
        FROM tables
    `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// API 2: CẬP NHẬT TRẠNG THÁI (Start/Stop - Dùng giờ Server)
app.put("/api/tables/:id", (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  let sql = "";
  let params = [];

  // Nếu bấm Start -> MySQL tự lấy giờ hiện tại (NOW)
  if (status === "Đang chơi") {
    sql = "UPDATE tables SET status = ?, start_time = NOW() WHERE id = ?";
    params = [status, id];
  }
  // Nếu bấm Stop -> Xóa giờ chơi (NULL)
  else {
    sql = "UPDATE tables SET status = ?, start_time = NULL WHERE id = ?";
    params = [status, id];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật:", err);
      return res.status(500).json({ error: "Lỗi Server khi cập nhật" });
    }
    res.json({ message: "Cập nhật thành công!" });
  });
});

app.put("/api/tables/:id/update-time", (req, res) => {
  const id = req.params.id;
  const { start_time } = req.body; // Nhận giờ mới từ Frontend (dạng chuỗi)

  // Cập nhật vào Database
  const sql = "UPDATE tables SET start_time = ? WHERE id = ?";

  db.query(sql, [start_time, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Lỗi cập nhật giờ" });
    }
    res.json({ message: "Đã cập nhật giờ thành công!" });
  });
});

// API 3: RESET DỮ LIỆU (Đưa hết về 0)
app.get("/api/reset", (req, res) => {
  const sql = "UPDATE tables SET status = 'Trống', start_time = NULL";
  db.query(sql, (err) => {
    if (err) return res.send("Lỗi reset: " + err.message);
    res.send("Đã RESET toàn bộ bàn về 0!");
  });
});

// API 4: SETUP (Tạo bảng và dữ liệu mẫu nếu chưa có)
app.get("/api/setup", (req, res) => {
  const sqlCreateTable = `
      CREATE TABLE IF NOT EXISTS tables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Trống',
        start_time DATETIME
      )
    `;
  const sqlClear = "TRUNCATE TABLE tables";
  const sqlInsert = `
      INSERT INTO tables (name, type, status) VALUES 
      ('Bàn 1', 'Lỗ', 'Trống'),
      ('Bàn 2', 'Phăng', 'Trống'),
      ('Bàn 3', 'Lỗ', 'Trống'),
      ('Bàn 4', 'Phăng', 'Trống')
    `;

  db.query(sqlCreateTable, (err) => {
    if (err) return res.status(500).send("Lỗi tạo bảng: " + err.message);
    db.query(sqlClear, (err) => {
      if (err) return res.status(500).send("Lỗi xóa cũ: " + err.message);
      db.query(sqlInsert, (err) => {
        if (err) return res.status(500).send("Lỗi thêm mới: " + err.message);
        res.send("Đã KHÔI PHỤC 4 bàn mẫu thành công!");
      });
    });
  });
});

// ================= KHỞI ĐỘNG SERVER =================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
