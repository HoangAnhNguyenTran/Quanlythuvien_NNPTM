const express = require("express");
const router = express.Router();
const db = require("../config/db");
const XLSX = require("xlsx");

// API Xuất danh sách sinh viên đang nợ sách quá hạn
router.get("/export-no-sach", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        dg.ho_ten AS 'Họ và Tên', 
        dg.id_doc_gia AS 'Mã Sinh Viên', 
        sv.ma_vach_id AS 'Mã Vạch Sách', 
        pm.han_tra AS 'Hạn Trả',
        DATEDIFF(NOW(), pm.han_tra) AS 'Số Ngày Quá Hạn'
      FROM chitietphieumuon ctp
      JOIN phieumuon pm ON ctp.id_phieu = pm.id_phieu
      JOIN docgia dg ON pm.id_doc_gia = dg.id_doc_gia
      JOIN sach_vatly sv ON ctp.ma_vach_id = sv.ma_vach_id
      WHERE ctp.ngay_tra_thuc_te IS NULL AND pm.han_tra < NOW()
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không có sinh viên nào nợ sách quá hạn." });
    }

    // Chuyển đổi dữ liệu sang format Excel
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNoSach");

    // Tạo buffer và gửi về client
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=BaoCao_NoSach.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    res.status(500).send("Lỗi xuất file: " + err.message);
  }
});

module.exports = router;