import { useState } from "react";
import API from "../services/api"; // Đảm bảo file api.js đã cấu hình axios
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    try {
      const res = await API.post("/login", {
        username,
        password
      });

      console.log("Dữ liệu nhận được:", res.data);

      if (res.data.success) {
        // LƯU TOKEN VÀO LOCALSTORAGE ĐỂ TEST AUTHORIZATION
        localStorage.setItem("token", res.data.token); 
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("role", res.data.role);
        
        alert("Đăng nhập thành công!");
        navigate("/dashboard");
      } else {
        alert(res.data.message || "Sai tài khoản hoặc mật khẩu");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      alert("Không thể kết nối đến Server hoặc sai cấu hình API");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 100, fontFamily: "Arial" }}>
      <div style={{ display: "inline-block", padding: "30px", border: "1px solid #ddd", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Đăng nhập Hệ thống</h2>
        <input
          style={{ padding: "10px", marginBottom: "15px", width: "250px", borderRadius: "5px", border: "1px solid #ccc" }}
          placeholder="Tên đăng nhập"
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          style={{ padding: "10px", marginBottom: "25px", width: "250px", borderRadius: "5px", border: "1px solid #ccc" }}
          type="password"
          placeholder="Mật khẩu"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button 
          onClick={handleLogin}
          style={{ padding: "10px 30px", cursor: "pointer", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold" }}
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}

export default Login;