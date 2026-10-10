const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
});

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-room", (roomId) => {
        console.log("Client joined:", socket.id);
        console.log("Room:", roomId);

        socket.join(roomId);
    });

    socket.on("send-message", ({ roomId, message }) => {
        console.log("Message:", message);

        socket.to(roomId).emit("receive-message", message);
    });

    socket.on("disconnect", () => {
        console.log("Server disconnected:", socket.id);
    });
});

server.listen(9000, () => {
    console.log("Server running on port 9000");
});