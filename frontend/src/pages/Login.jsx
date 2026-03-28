import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    // e.preventDefault(); // Nếu dùng trong thẻ <form>
    try {
      const res = await API.post("/login", {
        username,
        password
      });

      console.log("Kết quả trả về:", res.data);

      if (res.data.success) {
        // Lưu thông tin vào localStorage để Dashboard sử dụng
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("role", res.data.role);
        
        alert("Đăng nhập thành công!");
        navigate("/dashboard");
      } else {
        alert(res.data.message || "Sai tài khoản hoặc mật khẩu");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối đến Server (Port 5000)");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 100, fontFamily: "Arial" }}>
      <h2>Đăng nhập Hệ thống</h2>
      <div style={{ display: "inline-block", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
        <input
          style={{ padding: 8, marginBottom: 10, width: 200 }}
          placeholder="Tên đăng nhập"
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          style={{ padding: 8, marginBottom: 20, width: 200 }}
          type="password"
          placeholder="Mật khẩu"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button 
          onClick={handleLogin}
          style={{ padding: "8px 20px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4 }}
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}

export default Login;