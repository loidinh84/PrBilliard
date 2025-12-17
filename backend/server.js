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
  password: "123456",
  database: "billiards_db",
});

db.connect((err) => {
  if (err) console.error("Lỗi kết nối MySQL:", err);
  else console.log("Kết nối MySQL thành công!");
});

// ================= API ROUTES =================

// API 1: LẤY DANH SÁCH BÀN
app.get("/api/tables", (req, res) => {
  const sql = `SELECT id, name, type, status, DATE_FORMAT(start_time, '%Y-%m-%d %T') as start_time_str, TIMESTAMPDIFF(SECOND, start_time, NOW()) as play_seconds FROM tables`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// API 2: START / STOP
app.put("/api/tables/:id", (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  let sql =
    status === "Đang chơi"
      ? "UPDATE tables SET status = ?, start_time = NOW() WHERE id = ?"
      : "UPDATE tables SET status = ?, start_time = NULL WHERE id = ?";
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ error: "Lỗi update status" });
    res.json({ message: "Success" });
  });
});

// API 3: CẬP NHẬT GIỜ
app.put("/api/tables/:id/update-time", (req, res) => {
  const id = req.params.id;
  const { start_time } = req.body;
  db.query(
    "UPDATE tables SET start_time = ? WHERE id = ?",
    [start_time, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Lỗi update time" });
      res.json({ message: "Success" });
    }
  );
});

// ================= API MENU =================

// 1. Lấy Menu
app.get("/api/menu", (req, res) => {
  db.query("SELECT * FROM menu", (err, results) => {
    if (err) return res.status(500).json({ error: err.message }); // Báo lỗi chi tiết nếu chưa có bảng
    res.json(results);
  });
});

// 2. Thêm món
app.post("/api/menu", (req, res) => {
  const { name, price, category } = req.body;
  const sql = "INSERT INTO menu (name, price, category) VALUES (?, ?, ?)";
  db.query(sql, [name, price, category], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      id: results.insertId,
      name,
      price,
      category,
      message: "Thêm thành công",
    });
  });
});

// 3. Sửa món (ĐÃ SỬA LẠI THÀNH PUT) ✅
app.put("/api/menu/:id", (req, res) => {
  const { name, price, category } = req.body;
  const id = req.params.id;
  const sql = "UPDATE menu SET name = ?, price = ?, category = ? WHERE id = ?";
  db.query(sql, [name, price, category, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Cập nhật thành công" });
  });
});

// 4. Xóa món
app.delete("/api/menu/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM menu WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Xóa thành công" });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
