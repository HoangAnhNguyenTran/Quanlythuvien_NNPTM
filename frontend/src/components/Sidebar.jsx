import { Link, useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const name = localStorage.getItem("name") || "Người dùng";
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={sidebarStyle}>
      {/* HIỆU ỨNG SAO BĂNG (METEORS) */}
      <div className="star-container" style={starContainerStyle}>
        <div className="meteor m1"></div>
        <div className="meteor m2"></div>
        <div className="meteor m3"></div>
      </div>

      <div style={contentWrapper}>
        <h2 style={logoStyle}>📚 <span style={{color: '#fff'}}>LIB-SYS</span></h2>
        
        <div style={userInfoCard}>
          <div style={avatarStyle}>{name.charAt(0)}</div>
          <div style={{ textAlign: 'left' }}>
            <p style={userNameStyle}>{name}</p>
            <span style={roleBadgeStyle}>{role}</span>
          </div>
        </div>

        <div style={divider}></div>

        <nav style={navStyle}>
          <SidebarLink to="/dashboard" icon="📊" label="Thống kê chung" active={isActive("/dashboard")} />
          <SidebarLink to="/dashboard/muontra" icon="🔄" label="Mượn - Trả sách" active={isActive("/dashboard/muontra")} />
          <SidebarLink to="/dashboard/docgia" icon="👥" label="Quản lý độc giả" active={isActive("/dashboard/docgia")} />
          <SidebarLink to="/dashboard/dausach" icon="📚" label="Quản lý đầu sách" active={isActive("/dashboard/dausach")} />
          
          {role === "Admin" && (
            <SidebarLink to="/dashboard/nhanvien" icon="⚙️" label="Quản lý nhân viên" active={isActive("/dashboard/nhanvien")} />
          )}

          <button onClick={handleLogout} style={logoutMenuBtn}>
            <span style={{ fontSize: "18px", marginRight: "12px" }}>🚪</span>
            <span style={{ fontWeight: "600" }}>Đăng xuất</span>
          </button>
        </nav>

        {/* CSS Animation trực tiếp trong Component */}
        <style>{`
          @keyframes meteor {
            0% { transform: rotate(215deg) translateX(0); opacity: 1; }
            70% { opacity: 1; }
            100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
          }
          .meteor {
            position: absolute;
            width: 2px;
            height: 2px;
            background: linear-gradient(90deg, #ffffff, transparent);
            box-shadow: 0 0 10px #fff, 0 0 20px #fff;
            opacity: 0;
            animation: meteor 3s linear infinite;
          }
          .meteor::before {
            content: "";
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 60px;
            height: 1px;
            background: linear-gradient(90deg, #fff, transparent);
          }
          .m1 { top: 10%; right: -10%; animation-delay: 0s; }
          .m2 { top: 30%; right: -20%; animation-delay: 1s; }
          .m3 { top: 60%; right: -5%; animation-delay: 2s; }
        `}</style>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label, active }) {
  return (
    <Link to={to} style={linkStyle(active)}>
      <span style={{ fontSize: "18px", marginRight: "12px" }}>{icon}</span>
      <span style={{ fontWeight: active ? "600" : "400" }}>{label}</span>
    </Link>
  );
}

// --- STYLES GALAXY PASTEL ---
const sidebarStyle = {
  width: "260px",
  height: "calc(100vh - 40px)",
  position: "fixed",
  left: "20px",
  top: "20px",
  borderRadius: "24px",
  // Nền Galaxy Pastel (Xanh tím gradient nhạt)
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  boxShadow: "0 15px 35px rgba(118, 75, 162, 0.3)",
  zIndex: 1000,
  overflow: "hidden",
  boxSizing: "border-box",
};

const starContainerStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  pointerEvents: "none",
};

const contentWrapper = {
  padding: "30px 20px",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  position: "relative",
  zIndex: 2,
};

const logoStyle = { fontSize: "22px", fontWeight: "800", textAlign: "center", marginBottom: "25px", textShadow: "0 2px 10px rgba(255,255,255,0.2)" };

const userInfoCard = {
  display: "flex", alignItems: "center", gap: "12px", padding: "12px",
  background: "rgba(255, 255, 255, 0.15)", // Trong suốt kiểu Glassmorphism
  backdropFilter: "blur(10px)",
  borderRadius: "16px", marginBottom: "10px",
  border: "1px solid rgba(255, 255, 255, 0.2)"
};

const avatarStyle = {
  width: "35px", height: "35px", borderRadius: "10px",
  background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
  color: "#764ba2", fontWeight: "bold", flexShrink: 0
};

const userNameStyle = { margin: 0, fontWeight: "600", color: "#fff", fontSize: "14px" };
const roleBadgeStyle = { fontSize: "10px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontWeight: "bold" };
const divider = { height: "1px", background: "rgba(255,255,255,0.1)", margin: "15px 0" };
const navStyle = { display: "flex", flexDirection: "column", gap: "8px", flex: 1 };

const linkStyle = (active) => ({
  textDecoration: "none",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: "14px",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  background: active ? "rgba(255, 255, 255, 0.25)" : "transparent",
  transition: "0.3s",
  boxShadow: active ? "0 4px 15px rgba(0,0,0,0.1)" : "none",
});

const logoutMenuBtn = {
  background: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: "14px",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  width: "100%",
  transition: "0.3s",
  marginTop: "15px"
};

export default Sidebar;