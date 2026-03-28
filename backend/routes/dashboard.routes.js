const express = require("express");
const router = express.Router();
const db = require("../config/db");

// --- 1. ROUTE CHÍNH: GET /api/dashboard ---
// Phục vụ cả DashboardHome và Quản lý đầu sách
router.get("/", async (req, res) => {
  try {
    // A. LẤY DANH SÁCH ĐẦU SÁCH (Cho trang Quản lý sách - Giúp không bị trắng trang)
    const [bookList] = await db.query(`
      SELECT d.*, t.ten_the_loai 
      FROM dausach d 
      LEFT JOIN theloai t ON d.id_the_loai = t.id_the_loai
      ORDER BY d.id_dau_sach DESC
    `);

    // B. LẤY THỐNG KÊ (Cho DashboardHome)
    const [books] = await db.query("SELECT COUNT(*) as total FROM dausach");
    const [readers] = await db.query("SELECT COUNT(*) as total FROM docgia");
    const [borrowing] = await db.query(
      "SELECT COUNT(*) as total FROM chitietphieumuon WHERE ngay_tra_thuc_te IS NULL"
    );
    const [fines] = await db.query(
      "SELECT SUM(COALESCE(tien_phat_tre, 0)) as total FROM chitietphieumuon"
    );

    // C. TRUY VẤN BIỂU ĐỒ (6 tháng gần nhất)
    const [chartData] = await db.query(`
      SELECT 
        DATE_FORMAT(ngay_muon, '%m/%Y') AS thang, 
        COUNT(*) AS total 
      FROM phieumuon 
      GROUP BY thang 
      ORDER BY MIN(ngay_muon) ASC 
      LIMIT 6
    `);

    // D. TRẢ VỀ OBJECT TỔNG HỢP
    res.json({
      bookList: bookList, // Mảng danh sách sách
      tongDauSach: books[0]?.total || 0,
      tongDocGia: readers[0]?.total || 0,
      dangMuon: borrowing[0]?.total || 0,
      tienPhat: fines[0]?.total || 0,
      muonTheoThang: chartData || []
    });

  } catch (err) {
    console.error("🔥 DASHBOARD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- 2. LẤY DANH SÁCH THỂ LOẠI ---
router.get("/the-loai", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM theloai");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. THÊM ĐẦU SÁCH MỚI ---
router.post("/", async (req, res) => {
  const { isbn, ten_sach, tac_gia, id_the_loai } = req.body;
  try {
    const genreId = id_the_loai || 1;
    await db.query(
      "INSERT INTO dausach (isbn, ten_sach, tac_gia, id_the_loai) VALUES (?, ?, ?, ?)",
      [isbn, ten_sach, tac_gia, genreId]
    );
    res.json({ success: true, message: "Thêm thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. SINH MÃ VẠCH (SÁCH VẬT LÝ) ---
router.post("/sinh-ma-vach", async (req, res) => {
  const { id_dau_sach, so_luong } = req.body;
  try {
    const [last] = await db.query("SELECT ma_vach_id FROM sach_vatly ORDER BY ma_vach_id DESC LIMIT 1");
    let lastNum = (last && last.length > 0) ? parseInt(last[0].ma_vach_id.replace("BV", "")) : 0;
    
    for (let i = 1; i <= so_luong; i++) {
      const newCode = "BV" + String(lastNum + i).padStart(3, "0");
      await db.query(
        "INSERT INTO sach_vatly (ma_vach_id, id_dau_sach, trang_thai) VALUES (?, ?, 'SanSang')", 
        [newCode, id_dau_sach]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;