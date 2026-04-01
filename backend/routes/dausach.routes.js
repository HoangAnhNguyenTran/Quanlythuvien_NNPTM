const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// ================== CẤU HÌNH UPLOAD ẢNH ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ================== 1. LẤY THỂ LOẠI ==================
router.get("/the-loai", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM theloai");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải thể loại" });
  }
});

// ================== 2. LẤY DANH SÁCH ĐẦU SÁCH ==================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, t.ten_the_loai 
      FROM dausach d 
      LEFT JOIN theloai t ON d.id_the_loai = t.id_the_loai
      ORDER BY d.id_dau_sach DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== 3. THÊM ĐẦU SÁCH (CÓ ẢNH) ==================
router.post("/", upload.single("hinh_anh"), async (req, res) => {
  const { isbn, ten_sach, tac_gia, id_the_loai } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    await db.query(
      "INSERT INTO dausach (isbn, ten_sach, tac_gia, id_the_loai, hinh_anh) VALUES (?, ?, ?, ?, ?)",
      [isbn, ten_sach, tac_gia, id_the_loai, imagePath]
    );
    res.json({ success: true, message: "Thêm sách thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi thêm sách: " + err.message });
  }
});

// ================== 4. CẬP NHẬT ĐẦU SÁCH (CÓ THỂ UPDATE ẢNH) ==================
router.put("/:id", upload.single("hinh_anh"), async (req, res) => {
  const { id } = req.params;
  const { isbn, ten_sach, tac_gia, id_the_loai } = req.body;

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    if (imagePath) {
      // Có upload ảnh mới
      await db.query(
        "UPDATE dausach SET isbn=?, ten_sach=?, tac_gia=?, id_the_loai=?, hinh_anh=? WHERE id_dau_sach=?",
        [isbn, ten_sach, tac_gia, id_the_loai, imagePath, id]
      );
    } else {
      // Không đổi ảnh
      await db.query(
        "UPDATE dausach SET isbn=?, ten_sach=?, tac_gia=?, id_the_loai=? WHERE id_dau_sach=?",
        [isbn, ten_sach, tac_gia, id_the_loai, id]
      );
    }

    res.json({ success: true, message: "Cập nhật thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== 5. XÓA ĐẦU SÁCH (TRANSACTION) ==================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Kiểm tra sách đang mượn
    const [dangMuon] = await connection.query(
      "SELECT * FROM sach_vatly WHERE id_dau_sach = ? AND UPPER(trang_thai) = 'DANGMUON'",
      [id]
    );

    if (dangMuon.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        error: "Không thể xóa! Có sách đang được mượn."
      });
    }

    // Xóa bảng con
    await connection.query(
      "DELETE FROM sach_vatly WHERE id_dau_sach = ?",
      [id]
    );

    // Xóa bảng cha
    const [result] = await connection.query(
      "DELETE FROM dausach WHERE id_dau_sach = ?",
      [id]
    );

    await connection.commit();

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "Đã xóa đầu sách và mã vạch!"
      });
    } else {
      res.status(404).json({ error: "Không tìm thấy đầu sách." });
    }
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ================== 6. SINH MÃ VẠCH ==================
router.post("/sinh-ma-vach", async (req, res) => {
  const { id_dau_sach, so_luong } = req.body;

  try {
    const [last] = await db.query(
      "SELECT ma_vach_id FROM sach_vatly ORDER BY ma_vach_id DESC LIMIT 1"
    );

    let lastNum = 0;

    if (last.length > 0) {
      const numericPart = last[0].ma_vach_id.replace("BV", "");
      lastNum = parseInt(numericPart) || 0;
    }

    for (let i = 1; i <= so_luong; i++) {
      const newCode = `BV${String(lastNum + i).padStart(3, "0")}`;

      await db.query(
        "INSERT INTO sach_vatly (ma_vach_id, id_dau_sach, trang_thai) VALUES (?, ?, 'SanSang')",
        [newCode, id_dau_sach]
      );
    }

    res.json({ success: true, message: "Sinh mã vạch thành công!" });
  } catch (err) {
    res.status(500).json({
      error: "Lỗi sinh mã vạch: " + err.message
    });
  }
});

module.exports = router;