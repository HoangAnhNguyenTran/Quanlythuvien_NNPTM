import { useEffect, useState } from "react";
import axios from "axios";

function DauSach() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ isbn: "", ten_sach: "", tac_gia: "", id_the_loai: "" });
  const [editingId, setEditingId] = useState(null);
  const [barcodeData, setBarcodeData] = useState({ id_dau_sach: "", so_luong: 1 });

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dausach");
      setBooks(res.data);
    } catch (err) { console.error("Lỗi tải sách"); }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dausach/the-loai");
      setCategories(res.data);
      if (res.data.length > 0 && !editingId) {
        setFormData(f => ({ ...f, id_the_loai: res.data[0].id_the_loai }));
      }
    } catch (err) { console.error("Lỗi tải thể loại", err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/dausach/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/dausach", formData);
      }
      alert("Thao tác thành công!");
      setEditingId(null);
      setFormData({ isbn: "", ten_sach: "", tac_gia: "", id_the_loai: categories[0]?.id_the_loai || "" });
      fetchBooks();
    } catch (err) { alert(err.response?.data?.error || "Lỗi xử lý"); }
  };

  const handleDelete = async (id, ten) => {
    if (window.confirm(`Bạn có chắc muốn xóa đầu sách "${ten}"?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/dausach/${id}`);
        fetchBooks(); 
      } catch (err) { alert(err.response?.data?.error || "Không thể xóa."); }
    }
  };

  const handleSinhMaVach = async () => {
    if (!barcodeData.id_dau_sach) return alert("Vui lòng chọn đầu sách!");
    try {
      await axios.post("http://localhost:5000/api/dausach/sinh-ma-vach", barcodeData);
      alert("Sinh mã vạch thành công!");
      setBarcodeData({ id_dau_sach: "", so_luong: 1 });
    } catch (err) { alert(err.response?.data?.error || "Lỗi sinh mã vạch"); }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📖 QUẢN LÝ ĐẦU SÁCH & NHẬP KHO</h2>

      <div style={topSection}>
        {/* CARD THÊM SÁCH */}
        <div style={glassCard}>
          <h3 style={{ ...subTitle, color: "#667eea" }}>{editingId ? "📝 Chỉnh sửa thông tin" : "➕ Thêm đầu sách mới"}</h3>
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={inputBox}>
              <label style={labelStyle}>Mã ISBN</label>
              <input placeholder="VD: 978123456..." value={formData.isbn} onChange={e => setFormData({ ...formData, isbn: e.target.value })} required style={inputStyle} />
            </div>
            <div style={inputBox}>
              <label style={labelStyle}>Tên sách</label>
              <input placeholder="Nhập tên sách" value={formData.ten_sach} onChange={e => setFormData({ ...formData, ten_sach: e.target.value })} required style={inputStyle} />
            </div>
            <div style={inputBox}>
              <label style={labelStyle}>Tác giả</label>
              <input placeholder="Nhập tên tác giả" value={formData.tac_gia} onChange={e => setFormData({ ...formData, tac_gia: e.target.value })} required style={inputStyle} />
            </div>
            <div style={inputBox}>
              <label style={labelStyle}>Thể loại</label>
              <select value={formData.id_the_loai} onChange={e => setFormData({ ...formData, id_the_loai: e.target.value })} style={inputStyle} required>
                <option value="">-- Chọn thể loại --</option>
                {categories.map(c => <option key={c.id_the_loai} value={c.id_the_loai}>{c.ten_the_loai}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={btnPrimary}>{editingId ? "Cập Nhật" : "Lưu Sách"}</button>
              {editingId && <button type="button" onClick={() => setEditingId(null)} style={btnCancel}>Hủy</button>}
            </div>
          </form>
        </div>

        {/* CARD NHẬP KHO */}
        <div style={glassCard}>
          <h3 style={{ ...subTitle, color: "#27ae60" }}>📦 Nhập kho (Sinh mã vạch)</h3>
          <div style={formStyle}>
            <div style={inputBox}>
              <label style={labelStyle}>Chọn sách nhập kho</label>
              <select value={barcodeData.id_dau_sach} onChange={e => setBarcodeData({ ...barcodeData, id_dau_sach: e.target.value })} style={inputStyle}>
                <option value="">-- Chọn đầu sách --</option>
                {books.map(b => <option key={b.id_dau_sach} value={b.id_dau_sach}>{b.ten_sach}</option>)}
              </select>
            </div>
            <div style={inputBox}>
              <label style={labelStyle}>Số lượng bản sao</label>
              <input type="number" min="1" value={barcodeData.so_luong} onChange={e => setBarcodeData({ ...barcodeData, so_luong: e.target.value })} style={inputStyle} />
            </div>
            <button onClick={handleSinhMaVach} style={btnSuccess}>🚀 Xác nhận sinh mã</button>
          </div>
        </div>
      </div>

      {/* BẢNG DANH SÁCH */}
      <div style={tableContainer}>
        <div style={tableHeader}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>📑 Danh mục đầu sách</h3>
          <input 
            type="text" 
            placeholder="🔍 Tìm nhanh theo tên hoặc ISBN..." 
            style={searchInput} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        <table style={tableStyle}>
          <thead>
            <tr style={theadStyle}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>ISBN</th>
              <th style={thStyle}>Tên Sách</th>
              <th style={thStyle}>Tác giả</th>
              <th style={thStyle}>Thể loại</th>
              <th style={thStyle}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {books.filter(b => b.ten_sach.toLowerCase().includes(searchTerm.toLowerCase()) || b.isbn.includes(searchTerm)).map(b => (
              <tr key={b.id_dau_sach} style={trStyle}>
                <td style={tdStyle}><span style={idBadge}>{b.id_dau_sach}</span></td>
                <td style={tdStyle}>{b.isbn}</td>
                <td style={tdStyle}><b>{b.ten_sach}</b></td>
                <td style={tdStyle}>{b.tac_gia}</td>
                <td style={tdStyle}><span style={tagStyle}>{b.ten_the_loai || "---"}</span></td>
                <td style={tdStyle}>
                  <button onClick={() => { setEditingId(b.id_dau_sach); setFormData(b); }} style={btnEdit}>Sửa</button>
                  <button onClick={() => handleDelete(b.id_dau_sach, b.ten_sach)} style={btnDelete}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- STYLES GALAXY SYSTEM ---
const containerStyle = { padding: "30px", background: "#f8faff", minHeight: "100vh" };
const titleStyle = { color: "#2c3e50", fontSize: "24px", fontWeight: "800", marginBottom: "30px" };
const topSection = { display: "flex", gap: "25px", marginBottom: "30px" };
const glassCard = { flex: 1, padding: "25px", background: "#fff", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", border: "1px solid #f0f0f0" };
const subTitle = { fontSize: "16px", fontWeight: "700", marginBottom: "20px" };
const formStyle = { display: "flex", flexDirection: "column", gap: "15px" };
const inputBox = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "12px", fontWeight: "600", color: "#718096" };
const inputStyle = { padding: "12px", borderRadius: "12px", border: "1px solid #e0e7ff", outline: "none", fontSize: "14px", background: "#fcfdff" };

const btnPrimary = { flex: 1, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", padding: "12px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 15px rgba(118, 75, 162, 0.2)" };
const btnSuccess = { background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)", color: "white", padding: "12px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 15px rgba(46, 204, 113, 0.2)" };
const btnCancel = { background: "#f1f3f5", color: "#495057", padding: "12px 20px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "600" };

const tableContainer = { background: "#fff", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", overflow: "hidden", border: "1px solid #f0f0f0" };
const tableHeader = { padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f8faff" };
const searchInput = { width: "300px", padding: "10px 15px", borderRadius: "10px", border: "1px solid #e0e7ff", background: "#f8faff", outline: "none", fontSize: "13px" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const theadStyle = { background: "#f8faff" };
const thStyle = { padding: "15px 20px", textAlign: "left", fontSize: "13px", color: "#718096", fontWeight: "600" };
const trStyle = { borderBottom: "1px solid #f8faff" };
const tdStyle = { padding: "15px 20px", fontSize: "14px", color: "#444" };

const idBadge = { background: "#f0f3ff", color: "#5d78ff", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold", fontSize: "12px" };
const tagStyle = { background: "#f9f0ff", color: "#722ed1", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" };

const btnEdit = { background: "#e6f7ff", color: "#1890ff", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", marginRight: "8px", fontWeight: "600" };
const btnDelete = { background: "#fff1f0", color: "#ff4d4f", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };

export default DauSach;