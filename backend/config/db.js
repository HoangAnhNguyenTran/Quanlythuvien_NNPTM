const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Thay bằng mật khẩu của bạn nếu có
  database: "librarydb", // Đảm bảo tên database này khớp với MySQL của bạn
  waitForConnections: true,
  connectionLimit: 10
});

console.log("✅ MySQL Connected");
module.exports = db;