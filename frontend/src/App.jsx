import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardHome from "./pages/DashboardHome";
import NhanVien from "./pages/NhanVien";
import DauSach from "./pages/DauSach"; 
import MuonTra from "./pages/MuonTra";
import DashboardLayout from "./pages/DashboardLayout";
// THÊM MỚI: IMPORT TRANG ĐỘC GIẢ
import DocGia from "./pages/DocGia"; 

function App() {
  return (
    <Routes>
      {/* Trang đăng nhập nằm riêng */}
      <Route path="/" element={<Login />} />

      {/* Các trang Dashboard nằm trong Layout để luôn hiện Sidebar */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="nhanvien" element={<NhanVien />} />
        <Route path="dausach" element={<DauSach />} />
        <Route path="muontra" element={<MuonTra />} />
        
        {/* THÊM MỚI: ROUTE ĐỘC GIẢ */}
        <Route path="docgia" element={<DocGia />} />
      </Route>
    </Routes>
  );
}

export default App;