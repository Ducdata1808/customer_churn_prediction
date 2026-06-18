import axios from "axios";

// Fix #3: Tập trung URL Backend vào một chỗ duy nhất
// Thay vì mỗi file tự viết URL, tất cả đều import file này
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
  timeout: 15000, // Tự động báo lỗi nếu Backend mất hơn 15s không trả về
});

export default api;
