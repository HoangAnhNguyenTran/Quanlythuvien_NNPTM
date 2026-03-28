const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. Lấy danh sách thể loại
router.get("/the-loai", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM theloai");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Lỗi tải thể loại" }); }
});

// 2. Lấy danh sách đầu sách kèm tên thể loại
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, t.ten_the_loai 
      FROM dausach d 
      LEFT JOIN theloai t ON d.id_the_loai = t.id_the_loai
      ORDER BY d.id_dau_sach DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Thêm đầu sách mới
router.post("/", async (req, res) => {
  const { isbn, ten_sach, tac_gia, id_the_loai } = req.body;
  try {
    await db.query(
      "INSERT INTO dausach (isbn, ten_sach, tac_gia, id_the_loai) VALUES (?, ?, ?, ?)",
      [isbn, ten_sach, tac_gia, id_the_loai]
    );
    res.json({ success: true, message: "Thêm thành công!" });
  } catch (err) { res.status(500).json({ error: "Lỗi thêm sách: " + err.message }); }
});

// 4. Cập nhật đầu sách
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { isbn, ten_sach, tac_gia, id_the_loai } = req.body;
  try {
    await db.query(
      "UPDATE dausach SET isbn=?, ten_sach=?, tac_gia=?, id_the_loai=? WHERE id_dau_sach=?",
      [isbn, ten_sach, tac_gia, id_the_loai, id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. XÓA ĐẦU SÁCH (Sử dụng Transaction để xóa sạch mọi liên kết)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    // Lấy một kết nối riêng từ pool để thực hiện Transaction
    connection = await db.getConnection();
    await connection.beginTransaction(); // Bắt đầu quá trình xóa an toàn

    // Bước 1: Kiểm tra xem có cuốn sách vật lý nào ĐANG MƯỢN không
    const [dangMuon] = await connection.query(
      "SELECT * FROM sach_vatly WHERE id_dau_sach = ? AND UPPER(trang_thai) = 'DANGMUON'", 
      [id]
    );

    if (dangMuon.length > 0) {
      await connection.rollback(); // Hủy bỏ lệnh xóa nếu có sách đang mượn
      return res.status(400).json({ 
        error: "Không thể xóa! Hiện có sách thuộc đầu sách này đang được mượn." 
      });
    }

    // Bước 2: Xóa sạch ở bảng 'sach_vatly' (Bảng con)
    // Dù trạng thái là 'SanSang', MySQL vẫn coi đây là ràng buộc, phải xóa sạch trước.
    await connection.query("DELETE FROM sach_vatly WHERE id_dau_sach = ?", [id]);

    // Bước 3: Xóa ở bảng 'dausach' (Bảng cha)
    const [result] = await connection.query("DELETE FROM dausach WHERE id_dau_sach = ?", [id]);

    await connection.commit(); // Xác nhận xóa vĩnh viễn cả 2 bảng

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Đã xóa sạch đầu sách và các mã vạch liên quan!" });
    } else {
      res.status(404).json({ error: "Không tìm thấy đầu sách để xóa." });
    }

  } catch (err) {
    if (connection) await connection.rollback(); // Nếu lỗi thì khôi phục lại dữ liệu ban đầu
    console.error("Lỗi xóa chi tiết:", err);
    res.status(500).json({ error: "Lỗi hệ thống: " + err.message });
  } finally {
    if (connection) connection.release(); // Giải phóng kết nối về pool
  }
});

// 6. Sinh mã vạch (BV001, BV002...)
router.post("/sinh-ma-vach", async (req, res) => {
  const { id_dau_sach, so_luong } = req.body;
  try {
    const [last] = await db.query("SELECT ma_vach_id FROM sach_vatly ORDER BY ma_vach_id DESC LIMIT 1");
    let lastNum = 0;
    if (last && last.length > 0) {
      const numericPart = last[0].ma_vach_id.replace("BV", "");
      lastNum = parseInt(numericPart) || 0;
    }
    for (let i = 1; i <= so_luong; i++) {
      const newCode = `BV${String(lastNum + i).padStart(3, "0")}`;
      await db.query("INSERT INTO sach_vatly (ma_vach_id, id_dau_sach, trang_thai) VALUES (?, ?, 'SanSang')", 
      [newCode, id_dau_sach]);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Lỗi sinh mã vạch: " + err.message }); }
});

module.exports = router;