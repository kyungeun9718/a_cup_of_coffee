const io = require("socket.io-client");

// WebSocket 서버 주소 확인
const socket = io("http://localhost:3000", {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 3000
});

socket.on("connect", () => {
    console.log(`✅ Connected with ID: ${socket.id}`);
    socket.emit("subscribeToProduct", "20250309144242"); // 특정 상품 구독
});

socket.on("productUpdate", (data) => {
    console.log("🔄 Product Update Received:", data);
});

socket.on("connect_error", (err) => {
    console.error("❌ WebSocket 연결 오류:", err.message);
});
