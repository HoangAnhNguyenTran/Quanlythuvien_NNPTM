import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

function DashboardHome() {
  const [data, setData] = useState({
    tongDauSach: 0,
    tongDocGia: 0,
    dangMuon: 0,
    tienPhat: 0,
    muonTheoThang: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard");
      setData({
        tongDauSach: res.data.tongDauSach || 0,
        tongDocGia: res.data.tongDocGia || 0,
        dangMuon: res.data.dangMuon || 0,
        tienPhat: Number(res.data.tienPhat || 0),
        muonTheoThang: res.data.muonTheoThang || []
      });
    } catch (err) {
      console.error("🔥 Lỗi dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* TIÊU ĐỀ CHÍNH */}
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: "24px", color: "#2c3e50" }}>📈 Thống kê chung</h1>
        <button onClick={() => window.location.href = "http://localhost:5000/api/report/export-no-sach"} style={exportBtnStyle}>
          📥 Xuất báo cáo Excel
        </button>
      </div>

      {/* CÁC THẺ THỐNG KÊ (GRID 4 CỘT) */}
      <div style={statsGridStyle}>
        <StatCard title="Tổng Đầu Sách" value={data.tongDauSach} gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
        <StatCard title="Độc Giả" value={data.tongDocGia} gradient="linear-gradient(135deg, #2af598 0%, #009efd 100%)" />
        <StatCard title="Đang Cho Mượn" value={data.dangMuon} gradient="linear-gradient(135deg, #f6d365 0%, #fda085 100%)" />
        <StatCard title="Tiền Phạt" value={new Intl.NumberFormat("vi-VN").format(data.tienPhat) + "đ"} gradient="linear-gradient(135deg, #ff0844 0%, #ffb199 100%)" />
      </div>

      {/* BIỂU ĐỒ CHIẾM TOÀN BỘ CHIỀU RỘNG */}
      <div style={chartWrapperStyle}>
        <h3 style={chartTitleStyle}>📊 Xu hướng mượn sách 6 tháng gần nhất</h3>
        <div style={{ height: "400px", marginTop: "20px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.muonTheoThang}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="thang" axisLine={false} tickLine={false} tick={{fill: '#95a5a6', fontSize: 13}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#95a5a6', fontSize: 13}} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)'}} 
                cursor={{ stroke: '#8884d8', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#8884d8" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT CARD ---
function StatCard({ title, value, gradient }) {
  return (
    <div style={{
      background: gradient, padding: "25px", borderRadius: "16px", color: "#fff",
      boxShadow: "0 10px 20px rgba(0,0,0,0.08)", transition: "transform 0.3s ease"
    }}>
      <div style={{ fontSize: "14px", fontWeight: "500", opacity: 0.85, marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "26px", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

// --- CSS TRONG JS ---
const containerStyle = { padding: "25px", background: "#fdfdfd", minHeight: "90vh" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const statsGridStyle = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" };
const chartWrapperStyle = { background: "#fff", padding: "30px", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" };
const chartTitleStyle = { margin: 0, fontSize: "18px", color: "#34495e", fontWeight: "600" };
const exportBtnStyle = { 
  background: "#fff", border: "1px solid #e0e0e0", padding: "10px 20px", borderRadius: "10px", 
  fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#444" 
};

export default DashboardHome;